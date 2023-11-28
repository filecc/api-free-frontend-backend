const bcrypt = require("bcrypt");

class User {
    email;
    password;
    name;
    role;
    createdAt;
    updatedAt;

    constructor(email, password, name, role, updatedAt) {
        this.email = email;
        this.password = password;
        this.name = name;
        this.role = role ?? "user";
        this.createdAt = new Date().toISOString();
        this.updatedAt = updatedAt ?? new Date().toISOString();
    }

    static async createHashedPassword(password) {
        const saltRounds = 10;
        return await bcrypt.hash(password, saltRounds);
    }
}

module.exports = User;