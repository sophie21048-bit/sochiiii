
(function () {
  "use strict";

  const form = document.getElementById("route-form");
  const fromInput = document.getElementById("route-from");
  const toInput = document.getElementById("route-to");
  const status = document.getElementById("status");
  const buildButton = document.getElementById("build-route");
  const clearButton = document.getElementById("clear-route");

  let map = null;
  let activeRoute = null;

  function showStatus(message, type) {
    status.textContent = message;
    status.className = "status" + (type ? " status--" + type : "");
  }

  function initMap() {
    if (!window.ymaps) {
      showStatus(
        "Яндекс Карты не загрузились. Проверь API-ключ в index.html.",
        "error"
      );
      return;
    }

    ymaps.ready(function () {
      map = new ymaps.Map("map", {
        center: [55.751244, 37.618423],
        zoom: 10,
        controls: ["zoomControl", "geolocationControl"]
      });

      showStatus(
        "Карта загружена. Введи начальный и конечный адреса.",
        "success"
      );
    });
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const from = fromInput.value.trim();
    const to = toInput.value.trim();

    if (!from || !to) {
      showStatus("Заполни оба поля маршрута.", "error");
      return;
    }

    if (!map || !window.ymaps) {
      showStatus("Карта ещё не загрузилась. Проверь API-ключ.", "error");
      return;
    }

    buildButton.disabled = true;
    showStatus("Пытаемся построить маршрут…");

    if (activeRoute) {
      map.geoObjects.remove(activeRoute);
      activeRoute = null;
    }

    ymaps.route([from, to], {
      mapStateAutoApply: true,
      routingMode: "pedestrian"
    })
      .then(function (route) {
        activeRoute = route;
        map.geoObjects.add(route);

        const km = (route.getLength() / 1000).toLocaleString("ru-RU", {
          maximumFractionDigits: 1
        });

        showStatus(
          "Маршрут построен, расстояние около " + km +
          " км. Проверь доступность пути: наличие ступеней и пандусов не гарантируется.",
          "success"
        );
      })
      .catch(function (error) {
        console.error("Ошибка маршрута Яндекс:", error);
        showStatus(
          "Маршрут не построен. Проверь адреса и доступ к маршрутизации для своего API-ключа.",
          "error"
        );
      })
      .finally(function () {
        buildButton.disabled = false;
      });
  });

  clearButton.addEventListener("click", function () {
    fromInput.value = "";
    toInput.value = "";

    if (map && activeRoute) {
      map.geoObjects.remove(activeRoute);
      activeRoute = null;
    }

    showStatus("Введи начальный и конечный адреса.");
    fromInput.focus();
  });

  initMap();
})();
