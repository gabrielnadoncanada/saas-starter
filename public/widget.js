(function () {
  "use strict";

  // Public chat launcher loader.
  // Customers embed:
  //   <script src="https://{your-host}/widget.js"
  //           data-org="my-org"
  //           data-agent="sales-bot"
  //           data-base-url="https://your-host.com"  (optional; auto-detected from script src)
  //           data-primary-color="#111827"          (optional)
  //           async defer></script>
  //
  // The loader injects a floating launcher button; clicking opens an iframe
  // loaded from /embed/:org/:agent. CORS + cookies are configured so the
  // iframe talks directly to the chat API.
  var ID_PREFIX = "__saas_public_chat_";
  if (window[ID_PREFIX + "loaded"]) return;
  window[ID_PREFIX + "loaded"] = true;

  var currentScript =
    document.currentScript ||
    (function () {
      var scripts = document.getElementsByTagName("script");
      for (var i = scripts.length - 1; i >= 0; i -= 1) {
        if (scripts[i].src && scripts[i].src.indexOf("/widget.js") !== -1) {
          return scripts[i];
        }
      }
      return null;
    })();

  if (!currentScript) return;

  var ds = currentScript.dataset || {};
  var org = ds.org;
  var agent = ds.agent;
  if (!org || !agent) {
    console.warn("[public-chat] data-org and data-agent are required");
    return;
  }

  var baseUrl =
    ds.baseUrl ||
    (function () {
      try {
        var url = new URL(currentScript.src);
        return url.origin;
      } catch (_) {
        return "";
      }
    })();

  if (!baseUrl) {
    console.warn("[public-chat] could not resolve base URL");
    return;
  }

  var primaryColor = ds.primaryColor || "#111827";
  var launcherLabel = ds.label || "Chat";

  var launcher = document.createElement("button");
  launcher.type = "button";
  launcher.setAttribute("aria-label", "Open chat");
  launcher.id = ID_PREFIX + "launcher";
  Object.assign(launcher.style, {
    position: "fixed",
    right: "20px",
    bottom: "20px",
    zIndex: "2147483000",
    width: "auto",
    minWidth: "60px",
    height: "52px",
    padding: "0 18px",
    borderRadius: "26px",
    border: "0",
    background: primaryColor,
    color: "#ffffff",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: "14px",
    fontWeight: "600",
    boxShadow: "0 10px 25px rgba(0,0,0,0.18)",
    cursor: "pointer",
  });
  launcher.textContent = launcherLabel;

  var panel = document.createElement("div");
  panel.id = ID_PREFIX + "panel";
  Object.assign(panel.style, {
    position: "fixed",
    right: "20px",
    bottom: "84px",
    zIndex: "2147483001",
    width: "380px",
    maxWidth: "calc(100vw - 40px)",
    height: "560px",
    maxHeight: "calc(100vh - 110px)",
    boxShadow: "0 18px 45px rgba(0,0,0,0.22)",
    borderRadius: "14px",
    overflow: "hidden",
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    display: "none",
  });

  var iframe = document.createElement("iframe");
  iframe.title = "Chat";
  iframe.setAttribute("allow", "clipboard-write");
  iframe.setAttribute(
    "sandbox",
    "allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation",
  );
  iframe.src =
    baseUrl +
    "/embed/" +
    encodeURIComponent(org) +
    "/" +
    encodeURIComponent(agent);
  Object.assign(iframe.style, {
    width: "100%",
    height: "100%",
    border: "0",
    display: "block",
    background: "transparent",
  });

  var iframeLoaded = false;
  iframe.addEventListener("load", function () {
    iframeLoaded = true;
  });

  panel.appendChild(iframe);

  function togglePanel() {
    var showing = panel.style.display !== "none";
    if (showing) {
      panel.style.display = "none";
      launcher.textContent = launcherLabel;
    } else {
      panel.style.display = "block";
      launcher.textContent = "×";
      if (!iframeLoaded) {
        // Force src re-assign if blocked (e.g., by slow networks that aborted)
        // but only on the first user gesture.
        iframe.src = iframe.src;
      }
    }
  }

  launcher.addEventListener("click", togglePanel);

  function attach() {
    document.body.appendChild(panel);
    document.body.appendChild(launcher);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", attach);
  } else {
    attach();
  }
})();
