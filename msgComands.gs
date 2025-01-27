function msgComands(TelegramJSON) {
  let text = TelegramJSON.message.text;
  let chatid = TelegramJSON.message.chat.id;
  let userProperties = PropertiesService.getUserProperties();
  let msg, msg2 = '';
  
  
  if (text === '/addme'){
    if(Bot.getSystemUser() && Bot.getSystemUser().isAuth) {
      let msg = "Вы уже являетесь авторизованным пользователем.";
      Bot.sendMessage(msg);
      return;
    }
    if(Bot.getSystemUser()) {
      let msg = "Вы уже делали запрос раньше. Пожалуйста, дождитесь ответа администратора.";
      Bot.sendMessage(msg);
      return;
    }
    Bot.addSystemUser();
    msg = "Ваш запрос был отправлен администратору.";
    Bot.sendMessage(msg);
    // отправка сообщение с запросом администраторам
    let sendTo = superAdmin || Bot.getAdminsID();
    const len = sendTo.length;
    for(let i = 0; i < len; i++) {
      let options = {
        'chat_id': sendTo[i],
        'reply_markup': {
          'inline_keyboard': [
            [ 
              { 'text': '⛔️Отклонить', 'callback_data': 'user_deny_' + Bot.getUserID() },
              { 'text': '✅Принять', 'callback_data': 'user_approve_' + Bot.getUserID() }
            ]
          ]
        }
      };

      msg1 = "Этот пользователь запрашивает у вас разрешение\n\n" +
            "<i>ID        :</i> " + "<a href='" + Bot.mentionByID() +"'>" + Bot.getUserID() + "</a>\n" +
            "<i>Username  :</i> " + "<a href='" + Bot.mentionByID() +"'>" + Bot.getUsername() + "</a>\n" +
            "<i>First Name:</i> " + Bot.getUserFirstName() + "\n" +
            "<i>Last Name :</i> " + Bot.getUserLastName() + "\n" +
            "<i>Language  :</i> " + TelegramJSON.message.from.language_code + "\n" +
            "<i>Is bot    :</i> " + TelegramJSON.message.from.is_bot;
      Bot.sendMessage(msg1, options);
      return;
    }
  }

  if (text === '/privacy') {
    Bot.sendMessage(privacy_msg);
    return;
  }

  if (Bot.getSystemUser().isAuth || superAdmin.includes(chatid)) {
    
    let userData = JSON.parse(userProperties.getProperty(chatid));
    
    if (text === '/test') {
      Bot.sendMessage(userData.callback_query_data);
      Bot.sendMessage(search_row(userData.callback_query_data.split('_')[1], 'Test', 1));
      return;
    }
    
    if (text === '/cancel') { // отмена операций
      
      if (userData.callback_query_data.includes('sendoc')) { //если отмена в меню отправить документы
        return;
      }
    }

    if (text === '/test2') {
      let users = Sheet('users').getRange(2, 2, Sheet('users').getLastRow(), 9).getValues();
      msg = text +'\n<b>С уважением, отдел опеки г.Уфа</b>';
      Bot.sendMessage(userData.callback_query_data.split('_')[1]);
      Bot.sendMessage(users[1][8]);
      for (i in users) {
        if (users[i][8] === userData.callback_query_data.split('_')[1]){
          Bot.sendMessageTo(users[i][0], msg);
        }
      }
      return;
    }

    userProperties.deleteProperty(chatid);
    if (text === '/start') {
      if (superAdmin.includes(chatid)) {
        msg = "<b>Привет, Босс! Вы в главном МЕНЮ:</b>\n\n<i>выберите любой вариант из приведенного ниже списка.</i>";
        Bot.sendMessage(msg, {'reply_markup': {'inline_keyboard': menu[2]} } );
      }
      else{
        msg = "<b>Вы в главном МЕНЮ:</b>\n\n<i>выберите любой вариант из приведенного ниже списка.</i>";
        if (getSheetVal('users', search_row(chatid, 'users', 2), 9) === ''){// если статус заявки пустой, показывается полная клавиатура
          Bot.sendMessage(msg, {'reply_markup': {'inline_keyboard': menu[0]}});
        }
        else{
          Bot.sendMessage(msg, {'reply_markup': {'inline_keyboard': menu[0].slice(2)}});
        }
      }
      return;
    }

    
    if (text === '/send_rules' && superAdmin.includes(chatid) ) {
      const groupId = getSheetVal('Settings', 7, 2); 
      if(groupId){
        Bot.sendMessageTo(`@${groupId}`, rules, {'reply_markup': {'inline_keyboard': menu[6]}});
        return;
      }
      else{
        Bot.sendMessage('Добавьте имя для группы в листе Settings');
        return;
      }
    }

    if (text === '/help') {
      let msg = "<b><a href='" + Bot.mentionByID() +"'>" + Bot.getUserFullName() + "</a>, взгляни на команды:</b>\n\n /start - Запустить бота🔥 \n /donate - Донат❤️ \n /profile - профиль \n /addme - запрос на авторизацию \n /rate - поставить рейтинг💹 \n /privacy - какие данные используются \n /cancel - отмена";
      Bot.sendMessage(msg);
      return;
    }
    
    if (text === '/donate') {
      Bot.sendMessage(msgd);
      return;
    }

    if (text === '/top') {//команда для топлиста
      if (leaderBoard()) {
        let msg = leaderBoard();
        Bot.sendMessage(msg);
      }
      else{
        Bot.sendMessage("Список самых активных пуст!");
      }
      return;
    }

    if (text === '/profile'){
      msg = "<b>ID        :</b> " + Bot.getUserID() + "\n" +
            "<b>Username  :</b> " + "<a href='" + Bot.mentionByID() +"'>" + Bot.getUsername() + "</a>\n" +
            "<b>First Name:</b> " + Bot.getUserFirstName() + "\n" +
            "<b>Last Name :</b> " + Bot.getUserLastName() + "\n" +
            "<b>Language  :</b> " + TelegramJSON.message.from.language_code + "\n" +
            "<b>Is bot    :</b> " + TelegramJSON.message.from.is_bot;
      Bot.sendMessage(msg);
      return;
    }

    if (text === '/addme'){
      if(Bot.getSystemUser() && Bot.getSystemUser().isAuth) {
        let msg = "Вы уже являетесь авторизованным пользователем.";
        Bot.sendMessage(msg);
        return;
      }
      if(Bot.getSystemUser()) {
        let msg = "Вы уже делали запрос раньше. Пожалуйста, дождитесь ответа администратора.";
        Bot.sendMessage(msg);
        return;
      }
      Bot.addSystemUser();
      msg = "Ваш запрос был отправлен администратору.";
      Bot.sendMessage(msg);
      // отправка сообщение с запросом администраторам
      let sendTo = superAdmin || Bot.getAdminsID();
      const len = sendTo.length;
      for(let i = 0; i < len; i++) {
        let options = {
          'chat_id': sendTo[i],
          'reply_markup': {
            'inline_keyboard': [
              [ 
                { 'text': '⛔️Отклонить', 'callback_data': 'user_deny_' + Bot.getUserID() },
                { 'text': '✅Принять', 'callback_data': 'user_approve_' + Bot.getUserID() }
              ]
            ]
          }
        };

        msg1 = "Этот пользователь запрашивает у вас разрешение\n\n" +
              "<i>ID        :</i> " + "<a href='" + Bot.mentionByID() +"'>" + Bot.getUserID() + "</a>\n" +
              "<i>Username  :</i> " + "<a href='" + Bot.mentionByID() +"'>" + Bot.getUsername() + "</a>\n" +
              "<i>First Name:</i> " + Bot.getUserFirstName() + "\n" +
              "<i>Last Name :</i> " + Bot.getUserLastName() + "\n" +
              "<i>Language  :</i> " + TelegramJSON.message.from.language_code + "\n" +
              "<i>Is bot    :</i> " + TelegramJSON.message.from.is_bot;
        Bot.sendMessage(msg1, options);
        return;
      }
    }

    if (text === '/rate'){
      let keyboard = ['⭐️','⭐️⭐️','⭐️⭐️⭐️','⭐️⭐️⭐️⭐️','⭐️⭐️⭐️⭐️⭐️'];
      msg = "Как вы оцениваете этого бота?";
      Bot.sendMessageCustomKeyboard(msg, keyboard, 'Дайте мне свои звезды...');
      return;
    }
  }
  else {//если неавторизованный пользователь
    let msg = "Вы не зарегестрированы. \n<i>Пожалуйста, нажмите /addme, чтобы отправить запрос на авторизацию.</i>";
    Bot.sendMessage(msg);
    return;
  }
}