1. DevTinder API Endpoints
Auth Router.....

Handles user authentication, including signup, login, and logout.

    POST /signup: Register a new user.
    POST /login: Authenticate a user and issue a token.
    POST /logout: Revoke the user's session.

Profile Router....

Manages user profile-related operations.

    GET /profile/view: Retrieve the profile information of the logged-in user.
    PATCH /profile/edit: Update user profile details.
    PATCH /profile/password: Change the user's password.

Connection Request Router.....

Handles connection requests between users with various statuses:

    Status Options: ignore, interested, accepted, rejected.
    Endpoints:
        POST /request/send/intrested/:userId: Send a connection request to another user.
        POST /request/ignored/:userId: Mark a request as ignored.
        POST /request/review/accepted/:requestId: Accept a connection request.
        POST /request/review/rejected/:requestId: Reject a connection request.

User Router.......

Handles operations related to connections, requests, and the user feed.

    GET /user/connections: Get a list of connections for the logged-in user.
    GET /user/requests/received: Retrieve a list of received connection requests.
    GET /user/feed: Get a list of suggested users to connect with.
