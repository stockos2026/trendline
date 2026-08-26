async function loadReports(folder, containerId) {

  const container = document.getElementById(containerId);

  if (!container) return;

  try {

    const response = await fetch(
      "/reports?folder=" + encodeURIComponent(folder)
    );

    const reports = await response.json();

    container.innerHTML = "";

    reports.forEach((report, index) => {

      const box = document.createElement("a");

      box.className = "box";
      box.href = report.url;
      box.target = "_blank";

      const title = document.createElement("b");

      title.textContent =
        report.name
          .replace(/\.pdf$/i, "")
          .replace(/[0-9]+(\.[0-9]+)*$/,"")
          .replace(/[_-]+$/,"")
          .trim();

      const subtitle = document.createElement("span");
      subtitle.textContent = "Ανάλυση";

      if (index === 0) {

        const flash = document.createElement("span");

        flash.className = "flash-new";
        flash.textContent = "ΝΕΟ";

        const age =
          (Date.now() / 1000) - report.modified;

        if (age < 24 * 60 * 60) {
          box.appendChild(flash);
        }
      }

      box.appendChild(title);
      box.appendChild(subtitle);

      container.appendChild(box);

    });

  } catch (error) {

    console.error("Δεν ήταν δυνατή η φόρτωση των reports:", error);

  }
}