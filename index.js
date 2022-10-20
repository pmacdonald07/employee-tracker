const inquirer = require("inquirer");
const mysql = require("mysql2");

const db = mysql
  .createConnection(
    {
      host: "localhost",
      user: "root",
      password: "ArgenTina13#!",
      database: "employees",
    },
    console.log(`Connected to the employees database.`)
  )
  .promise();

const mainMenu = async () => {
  console.log("Hello! Welcome to EMPLOYEE TRACKER!");
  const { choice } = await inquirer.prompt([
    {
      type: "list",
      name: "choice",
      message: "What would you like to do?",
      choices: [
        {
          name: "View All Departments",
          value: "VIEW_DEPARTMENTS",
        },
        {
          name: "View All Roles",
          value: "VIEW_ROLES",
        },
        {
          name: "View All Employees",
          value: "VIEW_EMPLOYEES",
        },
        {
          name: "View All Employees by Manager",
          value: "VIEW_EMP_BY_MANAGER",
        },
        {
          name: "View All Employees by Department",
          value: "VIEW_EMP_BY_DEPARTMENT",
        },
        {
          name: "Add a Department",
          value: "ADD_DEPARTMENT",
        },
        {
          name: "Add a Role",
          value: "ADD_ROLE",
        },
        {
          name: "Add an Employee",
          value: "ADD_EMPLOYEE",
        },
        {
          name: "Update an Employee Role",
          value: "UPDATE_ROLE",
        },
        {
          name: "Update an Employee's Manager",
          value: "UPDATE_MANAGER",
        },
        {
          name: "Exit",
          value: "EXIT",
        },
      ],
    },
  ]);
  console.log(choice);
  switch (choice) {
    case "VIEW_EMPLOYEES":
      viewEmployees();
      break;
    case "VIEW_EMP_BY_MANAGER":
      viewEmpByManager();
      break;
    case "VIEW_EMP_BY_DEPARTMENT":
      viewEmpByDepartment();
      break;
    case "VIEW_DEPARTMENTS":
      viewDepartments();
      break;
    case "VIEW_ROLES":
      viewRoles();
      break;
    case "ADD_DEPARTMENT":
      addDepartment();
      break;
    case "ADD_ROLE":
      addRole();
      break;
    case "ADD_EMPLOYEE":
      addEmployee();
      break;
    case "UPDATE_ROLE":
      updateRole();
      break;
    case "UPDATE_MANAGER":
      updateManager();
      break;
    case "EXIT":
      process.exit();
    default:
      process.exit();
  }
};

const viewEmployees = async () => {
  const [employeeData] = await db.query(
    `SELECT employee.id,
      employee.first_name,
      employee.last_name,
      role.title AS job_title,
      department.name AS department,
      role.salary,
      CONCAT (manager.first_name, " ", manager.last_name) AS manager
      FROM employee
      LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id LEFT JOIN employee manager ON employee.manager_id = manager.id`
  );
  console.table(employeeData);
  mainMenu();
};

const viewEmpByManager = async () => {
  const [employeeData] = await db.query(
    `SELECT
      CONCAT (manager.first_name, " ", manager.last_name) AS manager,
      employee.id,
      employee.first_name,
      employee.last_name,
      role.title AS job_title,
      department.name AS department,
      role.salary
      FROM employee
      LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id LEFT JOIN employee manager ON employee.manager_id = manager.id
      ORDER BY manager`
  );
  console.table(employeeData);
  mainMenu();
};

const viewEmpByDepartment = async () => {
  const [employeeData] = await db.query(
    `SELECT
      department.name AS department,
      employee.id,
      employee.first_name,
      employee.last_name,
      role.title AS job_title,
      role.salary,
      CONCAT (manager.first_name, " ", manager.last_name) AS manager
      FROM employee
      LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id LEFT JOIN employee manager ON employee.manager_id = manager.id
      ORDER BY department`
  );
  console.table(employeeData);
  mainMenu();
};

const viewDepartments = async () => {
  const [departmentData] = await db.query(`SELECT * FROM department`);
  console.table(departmentData);
  mainMenu();
};

const viewRoles = async () => {
  const [roleData] = await db.query(
    `SELECT role.title AS job_title, role.id, department.name AS department, role.salary FROM role LEFT JOIN department ON role.department_id = department.id`
  );
  console.table(roleData);
  mainMenu();
};

const addDepartment = async () => {
  const promptValue = await inquirer.prompt([
    {
      type: "input",
      name: "department_name",
      message: "What is the name of the department you would like to add?",
    },
  ]);
  const sql = `INSERT INTO department (name) VALUES (?)`;
  const params = [promptValue.department_name];

  db.query(sql, params, (err, result) => {
    if (err) {
      console.log(err);
      return;
    }
  });

  console.log("Department has been added successfully!");
  mainMenu();
};

const addRole = async () => {
  const promptValue = await inquirer.prompt([
    {
      type: "input",
      name: "role_title",
      message: "What is the job title of the new role?",
    },
    {
      type: "int",
      name: "role_salary",
      message: "What is the role's salary?",
    },
    {
      type: "text",
      name: "role_department_id",
      message: "What is the new role's department id? (this will be a number)",
    },
  ]);

  const sql = `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`;
  const params = [
    promptValue.role_title,
    promptValue.role_salary,
    promptValue.role_department_id,
  ];

  db.query(sql, params, (err, result) => {
    if (err) {
      console.log(err);
      return;
    }
  });
  console.log("Role was added successfully!");
  mainMenu();
};

const addEmployee = async () => {
  const promptValue = await inquirer.prompt([
    {
      type: "input",
      name: "first_name",
      message: "What is the new employee's FIRST name?",
    },
    {
      type: "input",
      name: "last_name",
      message: "What is the employee's LAST name?",
    },
    {
      type: "int",
      name: "role_id",
      message:
        "What is the employee's role id? (visit VIEW ALL ROLES for role ids)",
    },
    {
      type: "text",
      name: "manager_id",
      message:
        "What is the employee's manager's id? Type 'null' if they have no manager. (visit VIEW ALL EMPLOYEES from the main menu for employee ids)",
    },
  ]);

  const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`;
  const params = [
    promptValue.first_name,
    promptValue.last_name,
    promptValue.role_id,
    promptValue.manager_id,
  ];

  db.query(sql, params, (err, result) => {
    if (err) {
      console.log(err);
      return;
    }
  });

  console.log("Employee successfully added!");
  mainMenu();
};

const updateRole = async () => {
  const [employeeInfo] = await db.query(
    `SELECT employee.first_name, employee.last_name, employee.id, employee.role_id AS current_role_id FROM employee`
  );
  console.table(employeeInfo);
  const promptValue1 = await inquirer.prompt([
    {
      type: "int",
      name: "employee_id",
      message:
        "What is the employee id of the employee you'd like to update? (visit VIEW ALL EMPLOYEES from the main menu to see employee ids)",
    },
  ]);
  const [roleInfo] = await db.query(
    `SELECT role.title AS role_title, role.id AS role_id FROM role`
  );
  console.table(roleInfo);
  const promptValue2 = await inquirer.prompt([
    {
      type: "int",
      name: "role_id",
      message:
        "What is the role id of the employee's new role? (visit VIEW ALL ROLES from the main menu to see role ids)",
    },
  ]);

  const sql = `UPDATE employee SET role_id=? WHERE id=?`;
  const params = [promptValue2.role_id, promptValue1.employee_id];

  db.query(sql, params, (err, result) => {
    if (err) {
      console.log(err);
      return;
    }
  });

  console.log("Employee's role was updated successfully!");
  mainMenu();
};

const updateManager = async () => {
  const [employeeData] = await db.query(`SELECT * FROM employee`);
  console.table(employeeData);
  const promptValue = await inquirer.prompt([
    {
      type: "int",
      name: "employee_id",
      message: "What is the employee id of the employee you want to update?",
    },
    {
      type: "int",
      name: "manager_id",
      message: "What is the employee id of the employee's new manager?",
    },
  ]);
  const sql = `UPDATE employee SET manager_id=? WHERE id=?`;
  const params = [promptValue.manager_id, promptValue.employee_id];

  db.query(sql, params, (err, result) => {
    if (err) {
      console.log(err);
      return;
    }
  });

  console.log("Employee's manager was updated successfully!");
  mainMenu();
};

mainMenu();
