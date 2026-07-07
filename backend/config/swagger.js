// backend/config/swagger.js
import swaggerJSDoc from 'swagger-jsdoc';

/**
 * Central OpenAPI 3.0 definition. Reusable schemas (ErrorResponse,
 * security scheme, Vector3, etc.) are defined once here under
 * `components`, then referenced via $ref in the JSDoc comments above
 * each route so every endpoint's documentation stays consistent without
 * repeating the same shape in every file.
 */
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Eventvista API',
    version: '1.0.0',
    description:
      'AI-driven event planning platform — API Gateway covering authentication, ' +
      'event/vendor management, the 3D layout engine, and the AI pipeline ' +
      '(Groq boundary parsing + Hugging Face TRELLIS 3D generation).',
    contact: {
      name: 'Eventvista Project Development',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000/api/v1',
      description: 'Local development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'JWT issued by POST /users/register or POST /users/login. ' +
          'Send as: Authorization: Bearer <token>',
      },
    },
    schemas: {
      /**
       * The standard shape returned by errorHandler.js for every failure
       * across the entire API — validation errors, auth failures, AI
       * pipeline upstream errors, collision/concurrency rejections, etc.
       */
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'A valid eventId is required.' },
          details: {
            type: 'object',
            nullable: true,
            description:
              'Extra structured context for certain errors, e.g. the ' +
              '"collisions" array on a 422 layout-save rejection.',
            example: null,
          },
          stack: {
            type: 'string',
            nullable: true,
            description: 'Only present when NODE_ENV=development.',
          },
        },
        required: ['success', 'message'],
      },
      Vector3: {
        type: 'object',
        properties: {
          x: { type: 'number', example: 0 },
          y: { type: 'number', example: 0 },
          z: { type: 'number', example: 0 },
        },
        required: ['x', 'y', 'z'],
      },
      UserPublic: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '665f1c2e8a1b2c3d4e5f6a7b' },
          name: { type: 'string', example: 'Ada Lovelace' },
          email: { type: 'string', example: 'ada@eventvista.test' },
          role: { type: 'string', enum: ['organiser', 'vendor', 'admin'], example: 'organiser' },
        },
      },
      AuthSuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { $ref: '#/components/schemas/UserPublic' },
          token: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          },
        },
      },
      Event: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '665f1c2e8a1b2c3d4e5f6a7b' },
          organiser: { type: 'string', example: '665f1c2e8a1b2c3d4e5f6a7b' },
          title: { type: 'string', example: "Ada's Summer Gala" },
          eventType: {
            type: 'string',
            enum: ['wedding', 'corporate', 'birthday', 'conference', 'exhibition', 'other'],
            example: 'corporate',
          },
          date: { type: 'string', format: 'date-time', example: '2026-09-12T18:00:00.000Z' },
          guestCount: { type: 'integer', example: 120 },
          venuePhotoUrl: { type: 'string', nullable: true },
          layout: { type: 'string', nullable: true, example: '665f1c2e8a1b2c3d4e5f6a7c' },
          budget: {
            type: 'object',
            properties: {
              total: { type: 'number', example: 15000 },
              spent: { type: 'number', example: 0 },
            },
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      EventCreateRequest: {
        type: 'object',
        required: ['title', 'date', 'guestCount'],
        properties: {
          title: { type: 'string', example: "Ada's Summer Gala" },
          eventType: {
            type: 'string',
            enum: ['wedding', 'corporate', 'birthday', 'conference', 'exhibition', 'other'],
            example: 'corporate',
          },
          date: { type: 'string', format: 'date-time', example: '2026-09-12T18:00:00.000Z' },
          guestCount: { type: 'integer', minimum: 1, example: 120 },
          budget: {
            type: 'object',
            properties: {
              total: { type: 'number', example: 15000 },
              spent: { type: 'number', example: 0 },
            },
          },
        },
      },
      EventUpdateRequest: {
        type: 'object',
        description: 'All fields optional — only supplied fields are updated.',
        properties: {
          title: { type: 'string' },
          eventType: {
            type: 'string',
            enum: ['wedding', 'corporate', 'birthday', 'conference', 'exhibition', 'other'],
          },
          date: { type: 'string', format: 'date-time' },
          guestCount: { type: 'integer', minimum: 1 },
          budget: {
            type: 'object',
            properties: {
              total: { type: 'number' },
              spent: { type: 'number' },
            },
          },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
};

const options = {
  swaggerDefinition,
  // Scan every route file for JSDoc @openapi blocks
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
