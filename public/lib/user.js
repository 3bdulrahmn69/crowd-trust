export class User {
  constructor(
    name,
    email,
    password,
    role,
    isActive = true,
    isApproved = false
  ) {
    this.name = name;
    this.email = email;
    this.password = password;
    this.role = role;
    this.isActive = isActive;
    this.isApproved = isApproved;
  }
}
