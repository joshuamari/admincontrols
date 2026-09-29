(function () {
  var releases = [];
  var currentVersion = "";
  var escapeBound = false;

  function versionUrl() {
    var parts = window.location.pathname.replace(/\\/g, "/").split("/");
    var idx = -1;
    for (var i = 0; i < parts.length; i++) {
      if (parts[i].toLowerCase() === "admincontrols") {
        idx = i;
        break;
      }
    }
    if (idx === -1) {
      return "../php/version.php";
    }
    return parts.slice(0, idx + 1).join("/") + "/php/version.php";
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatDate(isoDate) {
    if (!isoDate) return "";
    var parts = String(isoDate).split("-");
    if (parts.length !== 3) return String(isoDate);
    var date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    if (isNaN(date.getTime())) return String(isoDate);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function typeLabel(type) {
    var labels = {
      added: "Added",
      changed: "Changed",
      fixed: "Fixed",
      removed: "Removed",
      notes: "Notes",
    };
    return labels[type] || "Updates";
  }

  function mountTrigger(version) {
    if (!version || document.getElementById("appVersion")) return;
    var host = document.querySelector(".navigation");
    if (!host) return;

    var slot = document.createElement("div");
    slot.className = "app-version-slot";

    var credit = document.createElement("p");
    credit.className = "app-version-credit";
    credit.textContent = "\u00A92023 KDT.";

    var button = document.createElement("button");
    button.type = "button";
    button.id = "appVersion";
    button.className = "app-version-trigger";
    button.setAttribute("aria-haspopup", "dialog");
    button.setAttribute("aria-controls", "versionHistoryModal");
    button.setAttribute("aria-label", "Version " + version + ". View version history");
    button.title = "View version history";
    button.textContent = "v" + version;
    button.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      openHistory();
    });
    slot.appendChild(credit);
    slot.appendChild(button);
    host.appendChild(slot);
  }

  function chevron() {
    return (
      '<svg class="version-history-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="m6 9 6 6 6-6"></path></svg>'
    );
  }

  function highlightsMarkup(highlights) {
    if (!highlights || !highlights.length) {
      return '<p class="version-history-empty">No notes for this version.</p>';
    }

    var groups = [];
    var seen = {};
    highlights.forEach(function (item) {
      var type = String((item && item.type) || "added").toLowerCase();
      if (!seen[type]) {
        seen[type] = [];
        groups.push({ type: type, items: seen[type] });
      }
      var text = String((item && item.text) || "").trim();
      if (text) seen[type].push(text);
    });

    return groups
      .map(function (group) {
        if (!group.items.length) return "";
        var items = group.items
          .map(function (text) {
            return "<li>" + escapeHtml(text) + "</li>";
          })
          .join("");
        return (
          '<div class="version-history-group">' +
          '<p class="version-history-type is-' +
          escapeHtml(group.type) +
          '">' +
          escapeHtml(typeLabel(group.type)) +
          "</p>" +
          '<ul class="version-history-list">' +
          items +
          "</ul></div>"
        );
      })
      .join("");
  }

  function ensureModal() {
    if (document.getElementById("versionHistoryModal")) return;

    var backdrop = document.createElement("div");
    backdrop.className = "version-history-backdrop";
    backdrop.id = "versionHistoryBackdrop";
    backdrop.hidden = true;
    backdrop.innerHTML =
      '<div class="version-history-modal" id="versionHistoryModal" role="dialog" aria-modal="true" aria-labelledby="versionHistoryTitle" tabindex="-1">' +
      '<div class="version-history-header">' +
      "<div>" +
      '<h2 id="versionHistoryTitle">Version history</h2>' +
      "<p>What's new in Admin Controls</p>" +
      "</div>" +
      '<button type="button" class="version-history-close" aria-label="Close">&times;</button>' +
      "</div>" +
      '<div class="version-history-body" id="versionHistoryBody"></div>' +
      "</div>";
    document.body.appendChild(backdrop);

    backdrop
      .querySelector(".version-history-close")
      .addEventListener("click", closeHistory);
  }

  function renderBody() {
    var body = document.getElementById("versionHistoryBody");
    if (!body) return;
    if (!releases.length) {
      body.innerHTML =
        '<p class="version-history-empty">No version notes are available yet.</p>';
      return;
    }

    body.innerHTML = releases
      .map(function (release, index) {
        var version = String(release.version || "");
        var isCurrent =
          typeof release.current === "boolean"
            ? release.current
            : version !== "" && version === currentVersion;
        var isOpen = isCurrent || (index === 0 && !currentVersion);
        var dateLabel = formatDate(release.date);
        var panelId =
          "versionHistory-" + (version.replace(/[^a-z0-9.-]/gi, "-") || "unknown");
        return (
          '<section class="version-history-release' +
          (isOpen ? " is-open" : "") +
          '">' +
          '<button type="button" class="version-history-toggle" aria-expanded="' +
          (isOpen ? "true" : "false") +
          '" aria-controls="' +
          panelId +
          '">' +
          '<span class="version-history-heading">' +
          '<span class="version-history-version">v' +
          escapeHtml(version) +
          "</span>" +
          (isCurrent ? '<span class="version-history-badge">Current</span>' : "") +
          "</span>" +
          (dateLabel
            ? '<span class="version-history-date">' + escapeHtml(dateLabel) + "</span>"
            : "") +
          chevron() +
          "</button>" +
          '<div class="version-history-panel" id="' +
          panelId +
          '">' +
          highlightsMarkup(release.highlights) +
          "</div></section>"
        );
      })
      .join("");

    var toggles = body.querySelectorAll(".version-history-toggle");
    for (var i = 0; i < toggles.length; i++) {
      toggles[i].addEventListener("click", function () {
        var release = this.closest(".version-history-release");
        var willOpen = !release.classList.contains("is-open");
        var openOnes = body.querySelectorAll(".version-history-release");
        for (var j = 0; j < openOnes.length; j++) {
          openOnes[j].classList.remove("is-open");
          var toggle = openOnes[j].querySelector(".version-history-toggle");
          if (toggle) toggle.setAttribute("aria-expanded", "false");
        }
        if (willOpen) {
          release.classList.add("is-open");
          this.setAttribute("aria-expanded", "true");
        }
      });
    }
  }

  function onEscape(event) {
    if (event.key === "Escape") closeHistory();
  }

  function openHistory() {
    ensureModal();
    renderBody();
    var backdrop = document.getElementById("versionHistoryBackdrop");
    var modal = document.getElementById("versionHistoryModal");
    if (!backdrop || !modal) return;
    backdrop.hidden = false;
    modal.focus();
    if (!escapeBound) {
      document.addEventListener("keydown", onEscape);
      escapeBound = true;
    }
  }

  function closeHistory() {
    var backdrop = document.getElementById("versionHistoryBackdrop");
    if (backdrop) backdrop.hidden = true;
    if (escapeBound) {
      document.removeEventListener("keydown", onEscape);
      escapeBound = false;
    }
    if (document.activeElement && typeof document.activeElement.blur === "function") {
      document.activeElement.blur();
    }
  }

  function loadVersion() {
    fetch(versionUrl(), { credentials: "same-origin" })
      .then(function (response) {
        if (!response.ok) throw new Error("version");
        return response.json();
      })
      .then(function (payload) {
        var data = payload && payload.data ? payload.data : {};
        currentVersion = data.version ? String(data.version) : "";
        releases = Array.isArray(data.releases) ? data.releases : [];
        mountTrigger(currentVersion);
      })
      .catch(function () {});
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadVersion);
  } else {
    loadVersion();
  }
})();
