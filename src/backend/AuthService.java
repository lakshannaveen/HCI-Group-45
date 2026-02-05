package backend;

import java.util.HashMap;
import java.util.Map;

/**
 * Authentication service for handling user login and validation.
 */
public class AuthService {
    private Map<String, String> users;

    public AuthService() {
        users = new HashMap<>();
        // Default users for testing
        users.put("admin", "admin123");
        users.put("designer", "design456");
    }

    /**
     * Authenticates a user with the given credentials.
     * 
     * @param username The username to authenticate
     * @param password The password to verify
     * @return true if authentication is successful, false otherwise
     */
    public boolean authenticate(String username, String password) {
        if (username == null || password == null) {
            return false;
        }

        String storedPassword = users.get(username);
        return storedPassword != null && storedPassword.equals(password);
    }

    /**
     * Validates if the username meets the requirements.
     * 
     * @param username The username to validate
     * @return true if valid, false otherwise
     */
    public boolean isValidUsername(String username) {
        if (username == null || username.trim().isEmpty()) {
            return false;
        }
        // Username must be 3-20 characters, alphanumeric
        return username.matches("^[a-zA-Z0-9]{3,20}$");
    }

    /**
     * Validates if the password meets the requirements.
     * 
     * @param password The password to validate
     * @return true if valid, false otherwise
     */
    public boolean isValidPassword(String password) {
        if (password == null || password.length() < 6) {
            return false;
        }
        // Password must be at least 6 characters
        return true;
    }

    /**
     * Registers a new user.
     * 
     * @param username The username for the new user
     * @param password The password for the new user
     * @return true if registration is successful, false if user already exists
     */
    public boolean registerUser(String username, String password) {
        if (!isValidUsername(username) || !isValidPassword(password)) {
            return false;
        }

        if (users.containsKey(username)) {
            return false;
        }

        users.put(username, password);
        return true;
    }
}
