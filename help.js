// help.js - MySQL Help System
class HelpSystem {
    constructor() {
        this.modal = null;
        this.init();
    }

    init() {
        this.createModal();
        this.attachEvents();
    }

    createModal() {
        const modal = document.createElement('div');
        modal.id = 'helpModal';
        modal.className = 'modal';
        modal.innerHTML = this.getHelpContent();
        document.body.appendChild(modal);
        this.modal = modal;
    }

    getHelpContent() {
        return `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2 style="color: #667eea; margin-bottom: 20px;">📚 MySQL Query Help</h2>
            
            <div class="help-section">
                <h3>🔍 Basic Query Structure</h3>
                <div class="help-example">
                    SELECT column1, column2 FROM table
                    WHERE condition
                    GROUP BY column
                    HAVING group_condition
                    ORDER BY column
                    LIMIT count
                </div>
            </div>

            <div class="help-section">
                <h3>📋 Supported SQL Clauses</h3>
                <div class="sql-feature-grid">
                    <div class="feature-card">
                        <h4>SELECT</h4>
                        <p>Choose columns to display</p>
                        <code>SELECT Name, Salary</code><br>
                        <code>SELECT COUNT(*) AS Total</code>
                    </div>
                    <div class="feature-card">
                        <h4>WHERE</h4>
                        <p>Filter records</p>
                        <code>WHERE Salary > 50000</code><br>
                        <code>WHERE Name LIKE 'A%'</code>
                    </div>
                    <div class="feature-card">
                        <h4>GROUP BY</h4>
                        <p>Aggregate data</p>
                        <code>GROUP BY Department</code><br>
                        <code>GROUP BY YEAR(JoinDate)</code>
                    </div>
                    <div class="feature-card">
                        <h4>ORDER BY</h4>
                        <p>Sort results</p>
                        <code>ORDER BY Name ASC</code><br>
                        <code>ORDER BY Salary DESC</code>
                    </div>
                    <div class="feature-card">
                        <h4>LIMIT</h4>
                        <p>Restrict rows</p>
                        <code>LIMIT 10</code><br>
                        <code>LIMIT 5, 10</code>
                    </div>
                    <div class="feature-card">
                        <h4>HAVING</h4>
                        <p>Filter groups</p>
                        <code>HAVING COUNT(*) > 5</code><br>
                        <code>HAVING AVG(Salary) > 50000</code>
                    </div>
                </div>
            </div>

            <div class="help-section">
                <h3>🛠️ Advanced Features</h3>
                <div class="sql-feature-grid">
                    <div class="feature-card">
                        <h4>Joins (Basic)</h4>
                        <p>Combine tables</p>
                        <code>FROM table1 JOIN table2 ON table1.id = table2.id</code>
                    </div>
                    <div class="feature-card">
                        <h4>Aggregations</h4>
                        <p>Summarize data</p>
                        <code>COUNT(), SUM(), AVG()</code><br>
                        <code>MAX(), MIN(), GROUP_CONCAT()</code>
                    </div>
                    <div class="feature-card">
                        <h4>Date Functions</h4>
                        <p>Date handling</p>
                        <code>DATE(JoinDate)</code><br>
                        <code>YEAR(), MONTH(), DAY()</code>
                    </div>
                    <div class="feature-card">
                        <h4>String Functions</h4>
                        <p>Text manipulation</p>
                        <code>CONCAT(FirstName, ' ', LastName)</code><br>
                        <code>SUBSTRING(), UPPER(), LOWER()</code>
                    </div>
                    <div class="feature-card">
                        <h4>CASE Expressions</h4>
                        <p>Conditional logic</p>
                        <code>CASE WHEN Salary > 100000 THEN 'High' ELSE 'Normal' END</code>
                    </div>
                    <div class="feature-card">
                        <h4>Subqueries</h4>
                        <p>Nested queries</p>
                        <code>WHERE Salary > (SELECT AVG(Salary) FROM Employees)</code>
                    </div>
                </div>
            </div>

            <div class="help-section">
                <h3>📌 Operator Reference</h3>
                <table class="operator-table">
                    <tr><th>Type</th><th>Operators</th><th>Examples</th></tr>
                    <tr>
                        <td>Comparison</td>
                        <td>=, !=, >, <, >=, <=</td>
                        <td><code>Salary >= 50000</code></td>
                    </tr>
                    <tr>
                        <td>Logical</td>
                        <td>AND, OR, NOT</td>
                        <td><code>WHERE Dept = 'Sales' AND Salary > 60000</code></td>
                    </tr>
                    <tr>
                        <td>Pattern</td>
                        <td>LIKE, NOT LIKE</td>
                        <td><code>Name LIKE 'J%'</code> (starts with J)</td>
                    </tr>
                    <tr>
                        <td>Range</td>
                        <td>BETWEEN, NOT BETWEEN</td>
                        <td><code>Salary BETWEEN 30000 AND 60000</code></td>
                    </tr>
                    <tr>
                        <td>Set</td>
                        <td>IN, NOT IN</td>
                        <td><code>Dept IN ('Sales','Marketing')</code></td>
                    </tr>
                    <tr>
                        <td>Null</td>
                        <td>IS NULL, IS NOT NULL</td>
                        <td><code>Manager IS NOT NULL</code></td>
                    </tr>
                </table>
            </div>

            <div class="help-section">
                <h3>📊 Function Reference</h3>
                <table class="function-table">
                    <tr><th>Category</th><th>Functions</th><th>Examples</th></tr>
                    <tr>
                        <td>Aggregate</td>
                        <td>COUNT, SUM, AVG, MAX, MIN</td>
                        <td><code>SELECT AVG(Salary) FROM Employees</code></td>
                    </tr>
                    <tr>
                        <td>String</td>
                        <td>CONCAT, SUBSTR, TRIM, UPPER, LOWER</td>
                        <td><code>CONCAT(FirstName, ' ', LastName) AS FullName</code></td>
                    </tr>
                    <tr>
                        <td>Date</td>
                        <td>DATE, YEAR, MONTH, DAY, DATEDIFF</td>
                        <td><code>WHERE YEAR(JoinDate) = 2023</code></td>
                    </tr>
                    <tr>
                        <td>Math</td>
                        <td>ROUND, CEIL, FLOOR, ABS, MOD</td>
                        <td><code>ROUND(Salary, -3) AS RoundedSalary</code></td>
                    </tr>
                    <tr>
                        <td>Conditional</td>
                        <td>CASE, IF, IFNULL, COALESCE</td>
                        <td><code>CASE WHEN Salary > 100000 THEN 'High' ELSE 'Normal' END</code></td>
                    </tr>
                </table>
            </div>

            <div class="help-section">
                <h3>📝 Query Examples</h3>
                <div class="example-grid">
                    <div class="example-card">
                        <h4>Basic Query</h4>
                        <code>SELECT Name, Salary FROM Employees WHERE Department = 'Engineering' ORDER BY Salary DESC LIMIT 5</code>
                    </div>
                    <div class="example-card">
                        <h4>Aggregation</h4>
                        <code>SELECT Department, COUNT(*) AS EmpCount, AVG(Salary) AS AvgSalary FROM Employees GROUP BY Department HAVING COUNT(*) > 5</code>
                    </div>
                    <div class="example-card">
                        <h4>Date Filtering</h4>
                        <code>SELECT Name, JoinDate FROM Employees WHERE JoinDate > '2022-01-01' AND JoinDate < '2023-01-01'</code>
                    </div>
                    <div class="example-card">
                        <h4>Text Search</h4>
                        <code>SELECT * FROM Employees WHERE Name LIKE 'John%' OR Email LIKE '%company.com'</code>
                    </div>
                    <div class="example-card">
                        <h4>Complex Conditions</h4>
                        <code>SELECT Name, Salary, CASE WHEN Salary > 100000 THEN 'High' WHEN Salary > 70000 THEN 'Medium' ELSE 'Low' END AS Grade FROM Employees WHERE Department IN ('Engineering','Marketing')</code>
                    </div>
                    <div class="example-card">
                        <h4>Pagination</h4>
                        <code>SELECT * FROM Employees ORDER BY Name LIMIT 10 OFFSET 20</code>
                    </div>
                </div>
            </div>

            <div class="help-section">
                <h3>💡 Best Practices</h3>
                <ul class="best-practices">
                    <li>Use <code>WHERE</code> before <code>GROUP BY</code> to filter rows</li>
                    <li>Use <code>HAVING</code> after <code>GROUP BY</code> to filter groups</li>
                    <li>Quote string literals: <code>Name = 'John'</code></li>
                    <li>For dates, use ISO format: <code>JoinDate > '2022-01-01'</code></li>
                    <li>Use <code>LIKE</code> with wildcards: <code>%</code> (multiple chars), <code>_</code> (single char)</li>
                    <li>For performance, put most restrictive conditions first</li>
                </ul>
            </div>
        </div>
        `;
    }

    attachEvents() {
        // Close modal events
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('close') || e.target.id === 'helpModal') {
                this.closeModal();
            }
        });

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display === 'block') {
                this.closeModal();
            }
        });

        // F1 key to open help
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F1') {
                e.preventDefault();
                this.showModal();
            }
        });
    }

    showModal() {
        this.modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        const closeButton = this.modal.querySelector('.close');
        if (closeButton) {
            closeButton.focus();
        }
    }

    closeModal() {
        this.modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Initialize Help System
window.helpSystem = new HelpSystem();