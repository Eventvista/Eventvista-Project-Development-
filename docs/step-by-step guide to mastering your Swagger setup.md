Here is your step-by-step guide to mastering your Swagger setup.

---

## 1. Accessing the Swagger Dashboard

1. Make sure your local server is running (`npm run dev`).
2. Open your web browser and navigate to:

$$\text{http://localhost:5000/api-docs}$$



*(Note: If your server dynamically shifted to port 5001 or 5002 due to a port conflict, use that port instead!)*
3. You can also view the raw JSON specification that powers the UI at `http://localhost:5000/api-docs.json`.



---

## 2. Testing Your First Unauthenticated API Call

Let's try a simple, public endpoint that doesn't require you to sign in: the system health check.

1. Scroll down to the **Health** section (or find the `GET /api/v1/health` endpoint).


2. Click on the endpoint row to expand it.
3. Click the **"Try it out"** button on the right side.
4. Click the blue **"Execute"** button.
5. Scroll down slightly to see the **Server Response**. You should see a `200` status code and a JSON object containing the service name (`eventvista-api-gateway`) and the current timestamp.



---

## 3. The Authentication Flow (Testing Protected Routes)

Many of your controllers—like `eventController.js`, `layoutController.js`, and `aiController.js`—are wrapped in a `protect` middleware. If you try to run them without logging in, you will receive a `401 Not Authorised` error.

Here is how to authenticate yourself inside Swagger UI:

### Step A: Generate a JWT Token

1. Locate the **Users** section in the Swagger list.


2. Open `POST /api/v1/users/register` (or `/login`).


3. Click **"Try it out"**.


4. In the text box provided, update the placeholder JSON body with your test credentials:


```json
{
  "name": "Developer Admin",
  "email": "dev@eventvista.com",
  "password": "SecurePassword123",
  "role": "planner"
}

```


5. Click **"Execute"**.


6. In the response body below, copy the long alphanumeric string assigned to the `"token"` field (do not copy the quotation marks).



### Step B: Authorize Swagger

1. Scroll back to the very top of the Swagger webpage.
2. Click the **"Authorize"** button (it usually has a little padlock icon next to it).
3. In the input field, depending on how your `swagger.js` config file defines the scheme, type `Bearer ` followed by your copied token string:


```text
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

```


4. Click **"Authorize"**, then click **"Close"**.
5. Look closely at your protected routes (like `GET /api/v1/events/my-events`)—the padlock icon next to them should now appear **locked**, meaning your JWT token will be automatically injected into the `Authorization` header of every request you send!



---

## 4. Testing a Complex Endpoint (Example: AI Layout Generation)

Now that you are authorized, you can test a heavier route like the layout generation feature found in `aiController.js`:

1. Expand the `POST /api/v1/ai/generate-layout` endpoint.


2. Click **"Try it out"**.


3. Fill in the required payload parameters (`eventId`, a mock or real `imageBase64` string, and an array of `itemRequests`).


4. Click **"Execute"**.


5. Watch your terminal where `nodemon` is running; you should see the requests arriving, handled smoothly by your custom logger and global error limits.



If you run into any schema or layout verification issues while executing payloads, `validateLayout.js` will catch those structural anomalies early and output descriptive `400 Bad Request` messages right into the Swagger response window!
