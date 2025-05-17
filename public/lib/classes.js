export class User {
  constructor(
    id,
    name,
    email,
    password,
    role,
    isActive = true,
    isApproved = false
  ) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.role = role;
    this.isActive = isActive;
    this.isApproved = isApproved;
  }
}

export class Campaign {
  constructor(
    id,
    title,
    description,
    image,
    category,
    goal,
    raised = 0,
    deadline,
    creatorId,
    isApproved = false,
    rewards = []
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.image = image;
    this.category = category;
    this.goal = goal;
    this.raised = raised;
    this.deadline = deadline;
    this.creatorId = creatorId;
    this.isApproved = isApproved;
    this.rewards = rewards;
  }
}
