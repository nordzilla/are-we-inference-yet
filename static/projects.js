(() => {
  "use strict";

  const BUGZILLA_REST_URL = "https://bugzilla.mozilla.org/rest/bug";
  const BUGZILLA_BUG_URL = "https://bugzilla.mozilla.org/show_bug.cgi?id=";
  const BUG_BATCH_SIZE = 100;

  async function fetchBugs(url) {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
    });
    const payload = await response.json();

    if (!response.ok || payload.error) {
      throw new Error(payload.message || `Bugzilla returned ${response.status}`);
    }

    return payload.bugs || [];
  }

  async function fetchMetaBugs(product, component) {
    const url = new URL(BUGZILLA_REST_URL);
    url.searchParams.set("product", product);
    url.searchParams.set("component", component);
    url.searchParams.set("keywords", "meta");
    url.searchParams.set("keywords_type", "allwords");
    url.searchParams.set("include_fields", "id,summary,depends_on");

    return fetchBugs(url);
  }

  async function fetchDependencyStates(metaBugs) {
    const dependencyIDs = [...new Set(
      metaBugs.flatMap(bug => bug.depends_on || [])
    )];
    const states = new Map();

    for (let index = 0; index < dependencyIDs.length; index += BUG_BATCH_SIZE) {
      const batch = dependencyIDs.slice(index, index + BUG_BATCH_SIZE);
      const url = new URL(BUGZILLA_REST_URL);

      for (const id of batch) {
        url.searchParams.append("id", id);
      }
      url.searchParams.set("include_fields", "id,is_open");

      const bugs = await fetchBugs(url);
      for (const bug of bugs) {
        states.set(bug.id, bug.is_open);
      }
    }

    return states;
  }

  function classifyMetaBug(bug, dependencyStates) {
    const dependencyIDs = [...new Set(bug.depends_on || [])];
    const closedCount = dependencyIDs.filter(
      id => dependencyStates.get(id) === false
    ).length;
    const knownCount = dependencyIDs.filter(id => dependencyStates.has(id)).length;
    const unknownCount = dependencyIDs.length - knownCount;

    return {
      ...bug,
      dependencyCount: dependencyIDs.length,
      closedCount,
      unknownCount,
      completed: dependencyIDs.length > 0 &&
        unknownCount === 0 &&
        closedCount === dependencyIDs.length,
    };
  }

  function createExternalLink(text, url) {
    const link = document.createElement("a");
    link.href = url;
    link.textContent = text;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    return link;
  }

  function describeProgress(project) {
    if (project.dependencyCount === 0) {
      return "No dependent bugs are currently linked to this meta bug.";
    }

    if (project.completed) {
      const noun = project.dependencyCount === 1 ? "bug is" : "bugs are";
      return `All ${project.dependencyCount} dependent ${noun} complete.`;
    }

    let description = `${project.closedCount} of ${project.dependencyCount} dependent bugs are complete.`;
    if (project.unknownCount > 0) {
      description += ` ${project.unknownCount} could not be loaded.`;
    }
    return description;
  }

  function createProjectCard(project) {
    const milestones = document.createElement("div");
    milestones.className = "milestones";

    const descriptionOuter = document.createElement("div");
    descriptionOuter.className = "desc-box-outer";

    const description = document.createElement("div");
    description.className = "desc-box";

    const heading = document.createElement("h2");
    heading.appendChild(createExternalLink(
      project.summary,
      `${BUGZILLA_BUG_URL}${project.id}`
    ));

    const bugLink = createExternalLink(
      `Bug ${project.id}`,
      `${BUGZILLA_BUG_URL}${project.id}`
    );

    const progress = document.createElement("p");
    progress.textContent = describeProgress(project);

    description.append(heading, bugLink, progress);
    descriptionOuter.appendChild(description);

    const iframeContainer = document.createElement("div");
    iframeContainer.className = "iframe-container";
    iframeContainer.style.width = "70%";

    const iframeWrapper = document.createElement("div");
    const iframe = document.createElement("iframe");
    const query = new URLSearchParams();
    if (project.completed) {
      query.set("completed", "true");
    }
    query.set("blocks", project.id);

    iframe.src = `../burnup/index.html?${query}`;
    iframe.title = `${project.summary} project chart`;
    iframe.loading = "lazy";

    iframeWrapper.appendChild(iframe);
    iframeContainer.appendChild(iframeWrapper);
    milestones.append(descriptionOuter, iframeContainer);
    return milestones;
  }

  function renderProjects(container, projects, emptyMessage) {
    container.replaceChildren();

    if (projects.length === 0) {
      const status = document.createElement("p");
      status.className = "project-status";
      status.textContent = emptyMessage;
      container.appendChild(status);
      return;
    }

    const fragment = document.createDocumentFragment();
    for (const project of projects) {
      fragment.appendChild(createProjectCard(project));
    }
    container.appendChild(fragment);
  }

  function renderError(containers, error) {
    console.error("Unable to load Bugzilla projects", error);

    for (const container of containers) {
      const status = document.createElement("p");
      status.className = "project-status project-error";
      status.textContent = "Unable to load projects from Bugzilla. Please try again later.";
      container.replaceChildren(status);
    }
  }

  async function populateProjects() {
    const { projectProduct, projectComponent } = document.body.dataset;
    const ongoingContainer = document.getElementById("ongoing-project-list");
    const completedContainer = document.getElementById("completed-project-list");

    if (!projectProduct || !projectComponent ||
        !ongoingContainer || !completedContainer) {
      return;
    }

    try {
      const metaBugs = await fetchMetaBugs(projectProduct, projectComponent);
      const dependencyStates = await fetchDependencyStates(metaBugs);
      const projects = metaBugs
        .map(bug => classifyMetaBug(bug, dependencyStates))
        .sort((a, b) => b.id - a.id);

      renderProjects(
        ongoingContainer,
        projects.filter(project => !project.completed),
        "No ongoing projects found."
      );
      renderProjects(
        completedContainer,
        projects.filter(project => project.completed),
        "No completed projects found."
      );
    } catch (error) {
      renderError([ongoingContainer, completedContainer], error);
    }
  }

  populateProjects();
})();
