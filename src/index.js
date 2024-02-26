import './style/style.scss';

const messengerInitial = document.querySelector('.messenger__initial');
const messengerBtn = document.querySelector('.messenger__btn');
const messengerInput = document.querySelector('.messenger__input');
const messengerLoader = document.querySelector('.messenger__loader');
const messengerChat = document.querySelector('.messenger__chat');

messengerBtn.addEventListener('click', async () => {
  const inputNameValue = messengerInput.value.trim();
  if (!inputNameValue) {
    alert('Write your name in');
  } else {
    setTimeout(() => {
      messengerInitial.style.display = 'none';
      messengerLoader.style.display = 'block';
    }, 500);

    try {
      const response = await fetch('/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userName: inputNameValue }),
      });

      if (response.ok) {
        const data = await response.json();
        debugger
        const userID = data.userID;
        const userName = data.userName;
        localStorage.setItem('userID', userID);
        localStorage.setItem('userName', userName);
        console.log('Name has been saved');
        fuckingSheet(); // Важливо ініціалізувати ВебСокет після отримання данних. Бо асинхронне отримання і веб сокет встигає считати минулі дані.
        setTimeout(() => {
          messengerLoader.style.display = 'none';
        }, 3000);
        setTimeout(() => {
          messengerChat.style.display = 'flex';
        }, 3000);
      } else {
        console.error(
          `Error saving name: ${response.status} - ${response.statusText}`
        );
      }
    } catch (error) {
      alert('Something went wrong');
      console.error(`Error executing request: ${error}`);
    }
  }
});

function fuckingSheet() {
  const protocol = location.protocol === 'http:' ? 'ws' : 'wss';
  const ws = new WebSocket(`${protocol}://${location.host}`);

  // Відправка повідомлення

  const inputMessage = document.querySelector('.messenger__input-message');
  const inputMessageBtn = document.querySelector('.messenger__input-message-btn');

  if (inputMessage) {
    debugger
    const userID = localStorage.getItem('userID');
    const userName = localStorage.getItem('userName');

    inputMessageBtn.addEventListener('click', () => {
      const message = inputMessage.value.trim();
      if (message) {
        const data = { userName, userID, message };
        ws.send(JSON.stringify(data));
        inputMessage.value = '';
      } else {
        alert('The message is empty');
      }
    });
  }

  // Отримання повідомлень
  const messagesContainer = document.querySelector('.messages');

  ws.onmessage = (event) => {
    debugger;
    const data = JSON.parse(event.data);
    const receivedUserID = data.userID;
    const storedUserID = localStorage.getItem('userID');
    const userName = data.userName;
    const text = data.message;
    const time = new Date().toLocaleString('uk-UA', {
      hour: '2-digit',
      minute: '2-digit',
    });

    if (receivedUserID === storedUserID) {
      messagesContainer.insertAdjacentHTML(
        'beforeend',
        `
        <div class="messages__request">
            <div class="messages__header">
                 <p class="messages__sender">${userName}</p>
            </div>
            <div class="messages__body">
                 <p class="messages__content">${text}</p>
            </div>
            <div class="messages__footer">
                 <p class="messages__time">${time}</p>
            </div>
        </div>
        `
      );
    } else {
      messagesContainer.insertAdjacentHTML(
        'beforeend',
        `
      <div class="messages__respond">
           <div class="messages__header">
                <p class="messages__sender">${userName}</p>
            </div>
            <div class="messages__body">
                <p class="messages__content">${text}</p>
            </div>
            <div class="messages__footer">
                <p class="messages__time">${time}</p>
            </div>
        </div>
      `
      );
    }
  };
}