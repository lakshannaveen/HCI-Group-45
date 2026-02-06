package frontend;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

public class MainFrame extends JFrame {
    private DesignCanvas canvas;

    public MainFrame() {
        initializeUI();
    }

    private void initializeUI() {
        setTitle("Furniture Designer - Main");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(800, 600);
        setLocationRelativeTo(null);

        Color brown = new Color(107, 79, 58);
        Color cream = new Color(247, 241, 231);

        // Create menu bar
        JMenuBar menuBar = createMenuBar();
        menuBar.setBackground(cream);
        menuBar.setBorder(BorderFactory.createMatteBorder(0, 0, 1, 0, brown));
        setJMenuBar(menuBar);

        // Create canvas for drawing
        canvas = new DesignCanvas();
        add(canvas, BorderLayout.CENTER);

        // Add toolbar
        JToolBar toolBar = createToolBar();
        toolBar.setBackground(cream);
        toolBar.setBorder(BorderFactory.createMatteBorder(0, 0, 1, 0, brown));
        add(toolBar, BorderLayout.NORTH);
    }

    private JMenuBar createMenuBar() {
        JMenuBar menuBar = new JMenuBar();

        // File menu
        JMenu fileMenu = new JMenu("File");
        JMenuItem newItem = new JMenuItem("New Design");
        newItem.addActionListener(e -> canvas.newDesign());
        fileMenu.add(newItem);

        JMenuItem saveItem = new JMenuItem("Save Design");
        saveItem.addActionListener(e -> canvas.saveDesign());
        fileMenu.add(saveItem);

        JMenuItem openItem = new JMenuItem("Open Design");
        openItem.addActionListener(e -> canvas.openDesign());
        fileMenu.add(openItem);

        fileMenu.addSeparator();

        JMenuItem exitItem = new JMenuItem("Exit");
        exitItem.addActionListener(e -> System.exit(0));
        fileMenu.add(exitItem);

        menuBar.add(fileMenu);

        // Edit menu
        JMenu editMenu = new JMenu("Edit");
        JMenuItem undoItem = new JMenuItem("Undo");
        undoItem.addActionListener(e -> canvas.undo());
        editMenu.add(undoItem);

        JMenuItem deleteItem = new JMenuItem("Delete Selected");
        deleteItem.addActionListener(e -> canvas.deleteSelected());
        editMenu.add(deleteItem);

        menuBar.add(editMenu);

        // View menu
        JMenu viewMenu = new JMenu("View");
        JRadioButtonMenuItem view2D = new JRadioButtonMenuItem("2D View", true);
        view2D.addActionListener(e -> canvas.setViewMode(ViewMode.VIEW_2D));
        JRadioButtonMenuItem view3D = new JRadioButtonMenuItem("3D View");
        view3D.addActionListener(e -> canvas.setViewMode(ViewMode.VIEW_3D));

        ButtonGroup viewGroup = new ButtonGroup();
        viewGroup.add(view2D);
        viewGroup.add(view3D);

        viewMenu.add(view2D);
        viewMenu.add(view3D);

        menuBar.add(viewMenu);

        return menuBar;
    }

    private JToolBar createToolBar() {
        JToolBar toolBar = new JToolBar();

        Color brown = new Color(107, 79, 58);
        Color cream = new Color(247, 241, 231);
        Color buttonBg = new Color(242, 235, 226);

        JButton addRoomBtn = new JButton("Add Room");
        styleToolButton(addRoomBtn, brown, buttonBg);
        addRoomBtn.addActionListener(e -> canvas.addRoom());
        toolBar.add(addRoomBtn);

        JButton addChairBtn = new JButton("Add Chair");
        styleToolButton(addChairBtn, brown, buttonBg);
        addChairBtn.addActionListener(e -> canvas.addFurniture("Chair"));
        toolBar.add(addChairBtn);

        JButton addTableBtn = new JButton("Add Table");
        styleToolButton(addTableBtn, brown, buttonBg);
        addTableBtn.addActionListener(e -> canvas.addFurniture("Table"));
        toolBar.add(addTableBtn);

        toolBar.addSeparator();

        JButton scaleBtn = new JButton("Scale");
        styleToolButton(scaleBtn, brown, buttonBg);
        scaleBtn.addActionListener(e -> canvas.scaleSelected());
        toolBar.add(scaleBtn);

        JButton colorBtn = new JButton("Change Color");
        styleToolButton(colorBtn, brown, buttonBg);
        colorBtn.addActionListener(e -> canvas.changeColor());
        toolBar.add(colorBtn);

        JButton shadeBtn = new JButton("Add Shade");
        styleToolButton(shadeBtn, brown, buttonBg);
        shadeBtn.addActionListener(e -> canvas.addShade());
        toolBar.add(shadeBtn);

        return toolBar;
    }

    private void styleToolButton(JButton button, Color textColor, Color background) {
        button.setBackground(background);
        button.setForeground(textColor);
        button.setFocusPainted(false);
        button.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(textColor),
                BorderFactory.createEmptyBorder(6, 10, 6, 10)));
        button.setFont(new Font("Segoe UI", Font.PLAIN, 12));
    }

    // Inner class for the drawing canvas
    private class DesignCanvas extends JPanel {
        private ViewMode viewMode = ViewMode.VIEW_2D;

        public DesignCanvas() {
            setBackground(new Color(249, 244, 238));
            // Add mouse listeners for interaction (basic placeholder)
            addMouseListener(new java.awt.event.MouseAdapter() {
                @Override
                public void mouseClicked(java.awt.event.MouseEvent e) {
                    // Placeholder for selecting objects
                    repaint();
                }
            });
        }

        @Override
        protected void paintComponent(Graphics g) {
            super.paintComponent(g);
            Graphics2D g2d = (Graphics2D) g;
            g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

            // Draw room outline (placeholder)
            g2d.setColor(new Color(231, 222, 214));
            g2d.fillRect(50, 50, 400, 300);
            g2d.setColor(new Color(107, 79, 58));
            g2d.drawRect(50, 50, 400, 300);

            // Draw sample furniture (placeholder)
            g2d.setColor(new Color(153, 111, 79));
            g2d.fillRect(100, 100, 50, 50); // Chair
            g2d.setColor(new Color(120, 82, 58));
            g2d.fillRect(200, 150, 80, 40); // Table

            // Display view mode
            g2d.setColor(new Color(53, 39, 28));
            g2d.drawString("View Mode: " + viewMode, 10, 20);
        }

        public void newDesign() {
            // Clear canvas
            repaint();
            JOptionPane.showMessageDialog(this, "New design started.");
        }

        public void saveDesign() {
            JOptionPane.showMessageDialog(this, "Design saved (placeholder).");
        }

        public void openDesign() {
            JOptionPane.showMessageDialog(this, "Open design (placeholder).");
        }

        public void undo() {
            JOptionPane.showMessageDialog(this, "Undo (placeholder).");
        }

        public void deleteSelected() {
            JOptionPane.showMessageDialog(this, "Deleted selected item (placeholder).");
        }

        public void setViewMode(ViewMode mode) {
            this.viewMode = mode;
            repaint();
        }

        public void addRoom() {
            JOptionPane.showMessageDialog(this, "Add room dialog (placeholder).");
        }

        public void addFurniture(String type) {
            JOptionPane.showMessageDialog(this, "Added " + type + " (placeholder).");
            repaint();
        }

        public void scaleSelected() {
            JOptionPane.showMessageDialog(this, "Scale selected (placeholder).");
        }

        public void changeColor() {
            Color newColor = JColorChooser.showDialog(this, "Choose Color", Color.BLUE);
            if (newColor != null) {
                // Apply to selected item (placeholder)
                JOptionPane.showMessageDialog(this, "Color changed (placeholder).");
            }
        }

        public void addShade() {
            JOptionPane.showMessageDialog(this, "Shade added (placeholder).");
        }
    }

    private enum ViewMode {
        VIEW_2D, VIEW_3D
    }
}