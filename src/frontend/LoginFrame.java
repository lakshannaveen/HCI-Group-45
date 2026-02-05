package frontend;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import backend.AuthService;

public class LoginFrame extends JFrame {
    private JTextField usernameField;
    private JPasswordField passwordField;
    private JButton loginButton;
    private JLabel statusLabel;
    private AuthService authService;

    public LoginFrame() {
        authService = new AuthService();
        initializeUI();
    }

    private void initializeUI() {
        setTitle("Furniture Designer - Login");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(400, 250);
        setLocationRelativeTo(null);
        setResizable(false);

        // Main panel with padding
        JPanel mainPanel = new JPanel();
        mainPanel.setLayout(new BorderLayout(10, 10));
        mainPanel.setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));

        // Title label
        JLabel titleLabel = new JLabel("Furniture Designer App", SwingConstants.CENTER);
        titleLabel.setFont(new Font("Arial", Font.BOLD, 18));
        mainPanel.add(titleLabel, BorderLayout.NORTH);

        // Form panel
        JPanel formPanel = new JPanel(new GridLayout(3, 2, 10, 10));
        
        formPanel.add(new JLabel("Username:"));
        usernameField = new JTextField(20);
        formPanel.add(usernameField);

        formPanel.add(new JLabel("Password:"));
        passwordField = new JPasswordField(20);
        formPanel.add(passwordField);

        formPanel.add(new JLabel("")); // Empty cell
        loginButton = new JButton("Login");
        formPanel.add(loginButton);

        mainPanel.add(formPanel, BorderLayout.CENTER);

        // Status label
        statusLabel = new JLabel(" ", SwingConstants.CENTER);
        statusLabel.setForeground(Color.RED);
        mainPanel.add(statusLabel, BorderLayout.SOUTH);

        add(mainPanel);

        // Login button action
        loginButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                handleLogin();
            }
        });

        // Allow Enter key to trigger login
        passwordField.addActionListener(e -> handleLogin());
    }

    private void handleLogin() {
        String username = usernameField.getText().trim();
        String password = new String(passwordField.getPassword());

        if (username.isEmpty() || password.isEmpty()) {
            statusLabel.setText("Please enter both username and password.");
            return;
        }

        if (authService.authenticate(username, password)) {
            statusLabel.setForeground(Color.GREEN);
            statusLabel.setText("Login successful! Welcome, " + username);
            // Open main application window
            SwingUtilities.invokeLater(() -> {
                MainFrame mainFrame = new MainFrame();
                mainFrame.setVisible(true);
                dispose(); // Close login window
            });
        } else {
            statusLabel.setForeground(Color.RED);
            statusLabel.setText("Invalid username or password.");
            passwordField.setText("");
        }
    }
}
