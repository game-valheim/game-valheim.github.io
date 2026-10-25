(() => {
  "use strict";

  const copy = JSON.parse(document.getElementById("dialog-copy").textContent);
  let outboundDialog = null;

  function confirmExternal(trigger) {
    const destination = new URL(trigger.dataset.external);
    if (destination.protocol !== "https:" || destination.hostname !== "github.com") return;
    if (outboundDialog) outboundDialog.close();

    const dialog = document.createElement("dialog");
    dialog.className = "outbound-dialog";
    dialog.setAttribute("aria-labelledby", "outbound-question");

    const question = document.createElement("h2");
    question.id = "outbound-question";
    question.textContent = copy.question.replace("{site}", trigger.dataset.site);
    dialog.append(question);

    const actions = document.createElement("div");
    actions.className = "actions";
    const decline = document.createElement("button");
    decline.className = "button button-secondary";
    decline.type = "button";
    decline.textContent = copy.decline;
    decline.autofocus = true;
    decline.addEventListener("click", () => dialog.close());

    const yes = document.createElement("button");
    yes.className = "button button-primary";
    yes.type = "button";
    yes.textContent = copy.yes;
    yes.addEventListener("click", () => {
      try {
        window.open(destination.href, "_blank", "noopener,noreferrer");
        dialog.close();
      } catch {
        if (!dialog.querySelector('[role="alert"]')) {
          const error = document.createElement("p");
          error.setAttribute("role", "alert");
          error.textContent = copy.blocked;
          dialog.append(error);
        }
      }
    });
    actions.append(decline, yes);
    dialog.append(actions);
    dialog.addEventListener("click", event => {
      if (event.target !== dialog) return;
      const box = dialog.getBoundingClientRect();
      if (event.clientX < box.x || event.clientX > box.x + box.width || event.clientY < box.y || event.clientY > box.y + box.height) dialog.close();
    });
    dialog.addEventListener("close", () => {
      dialog.remove();
      if (outboundDialog === dialog) outboundDialog = null;
      trigger.focus({ preventScroll: true });
    }, { once: true });
    document.body.append(dialog);
    outboundDialog = dialog;
    dialog.showModal();
  }

  for (const trigger of document.querySelectorAll("[data-external]")) {
    trigger.addEventListener("click", () => confirmExternal(trigger));
  }

  // Prefetch the public pages linked from this presentation. Download files
  // remain ordinary direct links and are not fetched before selection.
  const prefetched = new Set();
  for (const link of document.querySelectorAll("a[data-prefetch]")) {
    const destination = new URL(link.href);
    if (destination.pathname.startsWith("/downloads/") || (destination.origin === location.origin && destination.pathname === location.pathname)) continue;
    destination.hash = "";
    if (prefetched.has(destination.href)) continue;
    prefetched.add(destination.href);
    const hint = document.createElement("link");
    hint.rel = "prefetch";
    hint.as = "document";
    hint.href = destination.href;
    document.head.append(hint);
  }
})();
