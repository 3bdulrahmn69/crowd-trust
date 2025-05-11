fetch('http://localhost:3000/projects')
  .then((res) => res.json())
  .then((projects) => {
    const container = document.getElementById('projects');
    projects.forEach((p) => {
      const div = document.createElement('div');
      div.innerHTML = `
        <h2>${p.title}</h2>
        <p>${p.description}</p>
        <p>Goal: $${p.goal}</p>
        <p>Raised: $${p.raised}</p>
      `;
      container.appendChild(div);
    });
  });
