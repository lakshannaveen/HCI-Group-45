package frontend;

import backend.AuthService;

import javax.swing.*;
import java.awt.*;

public class RegisterFrame extends JFrame {
    private final AuthService authService;
    private final JFrame loginFrame;
    private JTextField usernameField;
    private JPasswordField passwordField;
    private JPasswordField confirmPasswordField;
    private JLabel statusLabel;

    public RegisterFrame(AuthService authService, JFrame loginFrame) {
        this.authService = authService;
        this.loginFrame = loginFrame;
        initializeUI();
    }

    private void initializeUI() {
        setTitle("Furniture Designer - Register");
        setDefaultCloseOperation(JFrame.DISPOSE_ON_CLOSE);
        setSize(540, 400);
        setLocationRelativeTo(null);
        setResizable(false);

        Color brown = new Color(107, 79, 58);
        Color cream = new Color(247, 241, 231);
        Color lightBrown = new Color(220, 204, 192);
        Color textDark = new Color(53, 39, 28);

        JPanel mainPanel = new JPanel(new BorderLayout(10, 10));
        mainPanel.setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));
        mainPanel.setBackground(cream);

        JPanel headerPanel = new JPanel(new GridLayout(2, 1));
        headerPanel.setBackground(cream);
        JLabel titleLabel = new JLabel("Create Account", SwingConstants.CENTER);
        titleLabel.setFont(new Font("Segoe UI", Font.BOLD, 22));
        titleLabel.setForeground(textDark);
        JLabel subtitleLabel = new JLabel("Register to start designing", SwingConstants.CENTER);
        subtitleLabel.setFont(new Font("Segoe UI", Font.PLAIN, 13));
        subtitleLabel.setForeground(textDark);
        headerPanel.add(titleLabel);
        headerPanel.add(subtitleLabel);
        mainPanel.add(headerPanel, BorderLayout.NORTH);

        JPanel formPanel = new JPanel(new GridBagLayout());
        formPanel.setBackground(cream);
        GridBagConstraints gbc = new GridBagConstraints();
        gbc.insets = new Insets(8, 8, 8, 8);
        gbc.fill = GridBagConstraints.HORIZONTAL;

        JLabel usernameLabel = new JLabel("Username");
        usernameLabel.setFont(new Font("Segoe UI", Font.PLAIN, 13));
        usernameLabel.setForeground(textDark);
        gbc.gridx = 0;
        gbc.gridy = 0;
        formPanel.add(usernameLabel, gbc);

        usernameField = new JTextField(20);
        usernameField.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(lightBrown),
                BorderFactory.createEmptyBorder(6, 8, 6, 8)));
        gbc.gridx = 1;
        gbc.gridy = 0;
        formPanel.add(usernameField, gbc);

        JLabel passwordLabel = new JLabel("Password");
        passwordLabel.setFont(new Font("Segoe UI", Font.PLAIN, 13));
        passwordLabel.setForeground(textDark);
        gbc.gridx = 0;
        gbc.gridy = 1;
        formPanel.add(passwordLabel, gbc);

        passwordField = new JPasswordField(20);
        passwordField.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(lightBrown),
                BorderFactory.createEmptyBorder(6, 8, 6, 8)));
        gbc.gridx = 1;
        gbc.gridy = 1;
        formPanel.add(passwordField, gbc);

        JLabel confirmLabel = new JLabel("Confirm Password");
        confirmLabel.setFont(new Font("Segoe UI", Font.PLAIN, 13));
        confirmLabel.setForeground(textDark);
        gbc.gridx = 0;
        gbc.gridy = 2;
        formPanel.add(confirmLabel, gbc);

        confirmPasswordField = new JPasswordField(20);
        confirmPasswordField.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(lightBrown),
                BorderFactory.createEmptyBorder(6, 8, 6, 8)));
        gbc.gridx = 1;
        gbc.gridy = 2;
        formPanel.add(confirmPasswordField, gbc);

        JPanel buttonPanel = new JPanel(new GridLayout(1, 2, 10, 0));
        buttonPanel.setBackground(cream);
        JButton createAccountButton = new JButton("Create Account");
        createAccountButton.setBackground(brown);
        createAccountButton.setForeground(Color.WHITE);
        createAccountButton.setFocusPainted(false);
        createAccountButton.setBorder(BorderFactory.createEmptyBorder(8, 16, 8, 16));

        JButton backButton = new JButton("Back to Login");
        backButton.setBackground(Color.WHITE);
        backButton.setForeground(brown);
        backButton.setFocusPainted(false);
        backButton.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(brown),
                BorderFactory.createEmptyBorder(8, 16, 8, 16)));

        buttonPanel.add(createAccountButton);
        buttonPanel.add(backButton);

        gbc.gridx = 0;
        gbc.gridy = 3;
        gbc.gridwidth = 2;
        formPanel.add(buttonPanel, gbc);

        mainPanel.add(formPanel, BorderLayout.CENTER);

        statusLabel = new JLabel(" ", SwingConstants.CENTER);
        statusLabel.setFont(new Font("Segoe UI", Font.PLAIN, 12));
        statusLabel.setForeground(Color.RED);
        mainPanel.add(statusLabel, BorderLayout.SOUTH);

        add(mainPanel);

        createAccountButton.addActionListener(e -> handleRegister());
        backButton.addActionListener(e -> returnToLogin());
        confirmPasswordField.addActionListener(e -> handleRegister());
    }

    private void handleRegister() {
        String username = usernameField.getText().trim();
        String password = new String(passwordField.getPassword());
        String confirm = new String(confirmPasswordField.getPassword());

        if (username.isEmpty() || password.isEmpty() || confirm.isEmpty()) {
            statusLabel.setForeground(Color.RED);
            statusLabel.setText("Please complete all fields.");
            return;
        }

        if (!password.equals(confirm)) {
            statusLabel.setForeground(Color.RED);
            statusLabel.setText("Passwords do not match.");
            return;
        }

        if (!authService.isValidUsername(username)) {
            statusLabel.setForeground(Color.RED);
            statusLabel.setText("Username must be 3-20 letters/numbers.");
            return;
        }

        if (!authService.isValidPassword(password)) {
            statusLabel.setForeground(Color.RED);
            statusLabel.setText("Password must be at least 6 characters.");
            return;
        }

        if (authService.registerUser(username, password)) {
            statusLabel.setForeground(new Color(34, 139, 34));
            statusLabel.setText("Account created. Please log in.");
            SwingUtilities.invokeLater(this::returnToLogin);
        } else {
            statusLabel.setForeground(Color.RED);
            statusLabel.setText("Username already exists.");
        }
    }

    private void returnToLogin() {
        if (loginFrame != null) {
            loginFrame.setVisible(true);
        }
        dispose();
    }
}
