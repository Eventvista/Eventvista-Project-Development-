import { create } from 'zustand';
import axios from 'axios';

const API_BASE = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

/**
 * Computes the horizontal (x, z) distance between two position objects and
 * compares it against the combined collision radii of both objects.
 * Height (y) is intentionally excluded so stacked items at different
 * heights (e.g. a hanging light above a table) are not flagged.
 */
const isColliding = (posA, radiusA, posB, radiusB) => {
  const dx = posA.x - posB.x;
  const dz = posA.z - posB.z;
  const distance = Math.sqrt(dx * dx + dz * dz);
  return distance < radiusA + radiusB;
};

/**
 * Zustand store driving the R3F canvas. Holds the canonical in-memory
 * scene graph, exposes imperative mutators for drag events (called from
 * useFrame/onPointerMove handlers without triggering full React
 * re-renders on every frame), and handles serialisation to/from the
 * Layout REST endpoints.
 */
const useLayoutStore = create((set, get) => ({
  layoutId: null,
  eventId: null,
  revision: 0,
  venueBoundary: [], // [{ x, z }, ...]
  floorAreaSqm: 0,
  objects: [], // [{ objectId, label, category, modelUrl, position, rotation, scale, collisionRadius, locked }]
  activeDragId: null,
  collidingIds: new Set(),
  isSaving: false,
  isLoading: false,
  lastSavedAt: null,
  error: null,

  /* ------------------------------------------------------------ */
  /* Fetch / hydrate                                               */
  /* ------------------------------------------------------------ */

  fetchLayout: async (eventId, token) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axios.get(`${API_BASE}/layouts/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const layout = data.data;
      set({
        layoutId: layout._id,
        eventId: layout.event,
        revision: layout.revision,
        venueBoundary: layout.venueBoundary,
        floorAreaSqm: layout.floorAreaSqm,
        objects: layout.objects,
        isLoading: false,
      });
    } catch (err) {
      set({ isLoading: false, error: err.response?.data?.message || err.message });
      throw err;
    }
  },

  /* ------------------------------------------------------------ */
  /* Drag-and-drop mutation                                        */
  /* ------------------------------------------------------------ */

  beginDrag: (objectId) => set({ activeDragId: objectId }),

  /**
   * Called on every pointer-move frame while dragging. Updates the
   * object's position directly in the store and recomputes the live
   * collision set so meshes can be re-coloured (e.g. red on overlap)
   * without waiting for a save round-trip.
   */
  updateObjectPosition: (objectId, newPosition) => {
    const { objects } = get();

    const updatedObjects = objects.map((obj) =>
      obj.objectId === objectId ? { ...obj, position: newPosition } : obj
    );

    const movedObject = updatedObjects.find((o) => o.objectId === objectId);
    const collidingIds = new Set();

    updatedObjects.forEach((other) => {
      if (other.objectId === objectId) return;
      if (isColliding(movedObject.position, movedObject.collisionRadius, other.position, other.collisionRadius)) {
        collidingIds.add(objectId);
        collidingIds.add(other.objectId);
      }
    });

    set({ objects: updatedObjects, collidingIds });
  },

  updateObjectRotation: (objectId, newRotation) => {
    set((state) => ({
      objects: state.objects.map((obj) =>
        obj.objectId === objectId ? { ...obj, rotation: newRotation } : obj
      ),
    }));
  },

  endDrag: () => set({ activeDragId: null }),

  addObject: (newObject) => {
    const defaults = {
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      collisionRadius: 0.5,
      locked: false,
    };
    set((state) => ({ objects: [...state.objects, { ...defaults, ...newObject }] }));
  },

  removeObject: (objectId) => {
    set((state) => ({
      objects: state.objects.filter((obj) => obj.objectId !== objectId),
    }));
  },

  toggleLock: (objectId) => {
    set((state) => ({
      objects: state.objects.map((obj) =>
        obj.objectId === objectId ? { ...obj, locked: !obj.locked } : obj
      ),
    }));
  },

  /**
   * Full collision sweep across the entire scene, used before saving
   * rather than relying solely on the last drag's incremental check.
   */
  recomputeAllCollisions: () => {
    const { objects } = get();
    const collidingIds = new Set();

    for (let i = 0; i < objects.length; i += 1) {
      for (let j = i + 1; j < objects.length; j += 1) {
        const a = objects[i];
        const b = objects[j];
        if (isColliding(a.position, a.collisionRadius, b.position, b.collisionRadius)) {
          collidingIds.add(a.objectId);
          collidingIds.add(b.objectId);
        }
      }
    }

    set({ collidingIds });
    return collidingIds;
  },

  /* ------------------------------------------------------------ */
  /* Persistence                                                    */
  /* ------------------------------------------------------------ */

  /**
   * Serialises the current in-memory scene graph to plain JSON (stripping
   * any Three.js class instances down to primitive x/y/z numbers) and
   * PUTs it to the Layout endpoint, guarded by an optimistic-concurrency
   * revision check.
   */
  saveLayout: async (token) => {
    const { layoutId, objects, venueBoundary, floorAreaSqm, revision } = get();

    if (!layoutId) {
      set({ error: 'Cannot save: no active layout loaded.' });
      return;
    }

    const collisions = get().recomputeAllCollisions();
    if (collisions.size > 0) {
      set({ error: 'Cannot save while overlapping objects are present on the canvas.' });
      return;
    }

    set({ isSaving: true, error: null });

    const serialisedObjects = objects.map((obj) => ({
      objectId: obj.objectId,
      vendorId: obj.vendor || null,
      label: obj.label,
      category: obj.category,
      modelUrl: obj.modelUrl,
      position: { x: obj.position.x, y: obj.position.y, z: obj.position.z },
      rotation: { x: obj.rotation.x, y: obj.rotation.y, z: obj.rotation.z },
      scale: { x: obj.scale.x, y: obj.scale.y, z: obj.scale.z },
      collisionRadius: obj.collisionRadius,
      locked: obj.locked,
    }));

    try {
      const { data } = await axios.put(
        `${API_BASE}/layouts/${layoutId}`,
        {
          venueBoundary,
          floorAreaSqm,
          objects: serialisedObjects,
          expectedRevision: revision,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      set({
        revision: data.data.revision,
        isSaving: false,
        lastSavedAt: new Date().toISOString(),
      });
    } catch (err) {
      set({ isSaving: false, error: err.response?.data?.message || err.message });
      throw err;
    }
  },

  reset: () =>
    set({
      layoutId: null,
      eventId: null,
      revision: 0,
      venueBoundary: [],
      floorAreaSqm: 0,
      objects: [],
      activeDragId: null,
      collidingIds: new Set(),
      isSaving: false,
      isLoading: false,
      lastSavedAt: null,
      error: null,
    }),
}));

export default useLayoutStore;
