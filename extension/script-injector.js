(function () {
  const getScript = function () {
    const xhr = new XMLHttpRequest();

    xhr.onload = function () {
      if (window.wrappedJSObject) {
        window.eval(xhr.response);
      } else {
        const script = document.createElement('script');

        script.innerHTML = xhr.response;
        document.body.appendChild(script);
      }
    };

    xhr.onerror = function () {
      getScript();
    };

    xhr.open('GET', 'http://localhost:3008');
    xhr.send();
  };

  const socket = io('http://localhost:3007', { // eslint-disable-line
    transports: ['polling'],
    timeout: 30000
  });

  socket
    .once('connect', getScript)
    .on('connect', function requestStatusFromPage() {
      window.dispatchEvent(new CustomEvent('music:getStatus'));
    })
    .on('play', () => {
      window.dispatchEvent(new CustomEvent('music:play'));
    })
    .on('pause', () => {
      window.dispatchEvent(new CustomEvent('music:pause'));
    })
    .on('prev', () => {
      window.dispatchEvent(new CustomEvent('music:prev'));
    })
    .on('next', () => {
      window.dispatchEvent(new CustomEvent('music:next'));
    })

  window.addEventListener('music:status', (event) => {
    socket.emit('status', event.detail);
  });

  window.addEventListener('music:seeked', (event) => {
    socket.emit('seeked', event.detail);
  })
})();
