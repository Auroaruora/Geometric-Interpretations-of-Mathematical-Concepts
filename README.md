
# Geometric Interpretations of Mathematical Concepts

This project provides a collection of interactive web-based visualizations aimed at illustrating key concepts in **linear algebra** and **calculus**. It covers topics like changing bases, eigenvalues and eigenvectors, diagonalization, and flow lines in vector fields. Users can explore these abstract mathematical ideas through intuitive, visual tools.

---

## Project Structure

```
├── README.md               # Project documentation
├── css/                    # CSS styles
│   ├── global.css          # Global styles for consistency
│   ├── style.css           # Main stylesheet for all pages
│   └── testing.css         # Styles used for development testing
├── js/                     # JavaScript libraries and helper functions
│   ├── 2dMatrix.js         # Operations on 2D matrices
│   ├── HC.js               # Helper utilities (Part 1)
│   ├── HC22.js             # Helper utilities (Part 2)
│   ├── Vector.js           # Vector operations and transformations
│   ├── d3.js               # D3 library for data visualization
│   ├── jquery.js           # jQuery library for DOM manipulation
│   └── rational.js         # Operations with rational numbers
└── project/                # Modules for specific mathematical topics
    ├── changeBasis/
    │   ├── changeBasis.html  # Visualizing change of basis
    │   └── js/               # Supporting JavaScript for this module
    ├── diagnalizable/
    │   ├── diagnalizable.html # Exploring matrix diagonalization
    │   └── js/                # Supporting JavaScript for this module
    ├── eigenvectors/
    │   ├── eigenvectors.html  # Visualizing eigenvectors and eigenspaces
    │   └── js/                # Supporting JavaScript for this module
    └── flowLine/
        ├── flowLine.html      # Visualizing flow lines in vector fields
        └── js/                # Supporting JavaScript for this module
```

---

## Features and Pages

1. **Change of Basis**  
   Visualizes how vectors change when switching between two bases.  
   - Users can input different bases and vectors to see the transformations in real time.
   - Uses linear algebra concepts such as **basis transformations** and **invertible matrices**.

2. **Diagonalization**  
   Shows the diagonalization process of matrices visually.  
   - Users interact with the matrix to discover its diagonal form and eigenvectors.
   - Reinforces understanding of **characteristic polynomials** and **eigenvalues**.

3. **Eigenvectors and Eigenspaces**  
   Helps users explore **eigenvalues**, **eigenvectors**, and **eigenspaces**.  
   - Users hover on a canvas to select vectors and explore their properties.
   - Explains the relationship between eigenvectors and transformations geometrically.

4. **Flow Lines in Vector Fields**  
   Visualizes flow lines using numerical methods.  
   - Introduces **Euler's method** and **Runge-Kutta method** to approximate flow lines.
   - Users can click or generate random points to visualize the behavior of flow lines.

---

## Technologies Used

- **HTML/CSS/JavaScript**: Core web technologies for interactivity and styling.
- **Bootstrap 5**: For responsive design and UI components.
- **D3.js**: Library for dynamic data visualization.
- **MathJax**: For rendering mathematical equations in HTML.
- **jQuery**: Simplifies DOM manipulation and event handling.

---

## How to Run

1. Clone the repository to your local machine:
   ```bash
   git clone <repository_url>
   cd Summer-Research-2022
   ```

2. Open any HTML file in a browser to explore the visualizations. Example:
   - `project/changeBasis/changeBasis.html`
   - `project/eigenvectors/eigenvectors.html`

3. If some features don’t load properly, serve the project using a local server:
   ```bash
   python3 -m http.server
   ```
   Then access it via [http://localhost:8000](http://localhost:8000).

---

## Interaction Tips

- **Change of Basis**:  
  Input different bases to see how the same vector changes coordinates.

- **Eigenvectors**:  
  Hover on vectors to discover their alignment with transformations and their eigenvalues.

- **Flow Lines**:  
  Click points on the canvas to generate flow lines. Use the slider to zoom in/out for better exploration.

---

## Known Issues

- **Duplicate Files**: Some configuration files, such as `code-workspace`, are duplicated across directories.
- **Testing CSS Location**: A `testing.css` file is misplaced under the `js/` directory.

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

## Contributing

1. Fork the repository.
2. Create a new branch for your feature:
   ```bash
   git checkout -b new-feature
   ```
3. Commit your changes and push the branch:
   ```bash
   git commit -m "Add new feature"
   git push origin new-feature
   ```
4. Submit a pull request.

---

This project bridges the gap between abstract mathematical concepts and practical understanding using visual and interactive tools. Enjoy exploring linear algebra and calculus concepts with these engaging modules!
