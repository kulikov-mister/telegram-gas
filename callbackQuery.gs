function callbackQuery(TelegramJSON) {//обработка нажатий в личном чате пользователя
  let cb = TelegramJSON.callback_query;
  let options = {
    chat_id: cb.message.chat.id,
    message_id: cb.message.message_id,
    data: cb.data,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    disable_notification: true,
    text: '' || cb.message.text,
    reply_markup: '',
  }
  let userProperties = PropertiesService.getUserProperties();
  let userData = JSON.parse(userProperties.getProperty(options.chat_id));
  let msg, msg2 = '';

  if (Bot.getSystemUser() && Bot.getSystemUser().isAuth || superAdmin.includes(options.chat_id)) { // остальные сообщения для авторизованных пользователей

    if (options.data === 'menu_start') {
      userProperties.deleteProperty(options.chat_id);
      if (Bot.getSystemUser().isAdmin || superAdmin.includes(options.chat_id)) {//если админ возвращается в меню
        Bot.sendChatAction();
        msg = "<b>Привет, Босс! Вы в главном МЕНЮ:</b>\n\n<i>выберите любой вариант из приведенного ниже списка.</i>";
        Bot.editMessageKeyboard(msg, options.message_id, null, {'inline_keyboard': menu[2]});
        Bot.request('answerCallbackQuery', { callback_query_id: cb.id});
      }
      else{
        let ind = search_row(options.chat_id, 'users', 2); //индекс пользователя в базе данных
        Bot.sendChatAction();
        Bot.request('answerCallbackQuery', { callback_query_id: cb.id});
        msg = "<b>Вы в главном МЕНЮ:</b>\n\n<i>выберите любой вариант из приведенного ниже списка.</i>";
        
        if (getSheetVal('users', ind, 9) === '') {// если статус заявки пустой, показывается полная клавиатура
          Bot.editMessageKeyboard(msg, options.message_id, null, {'inline_keyboard': menu[0]});
        }
        else{
          Bot.editMessageKeyboard(msg, options.message_id, null, {'inline_keyboard': menu[0].slice(2)});
        }
      }
      return;
    }

    if (options.data === 'stop') {
      Bot.request('answerCallbackQuery', { callback_query_id: cb.id, text: '🥺 Дальше пусто' });
      return;
    }

    if (options.data === 'Hotlines'){
      Bot.sendChatAction();
      if(hotlines_msg !== ''){ //если ссылка для расписания имеется
        Bot.editMessageKeyboard(hotlines_msg, options.message_id, null, {"inline_keyboard": [[{text: '🏡 Назад', callback_data: 'menu_start'}]] });
        Bot.request('answerCallbackQuery', { callback_query_id: cb.id});
      }
      else{
        Bot.request('answerCallbackQuery', { callback_query_id: cb.id, text: '🥺 Телефоны доверия отсутсвуют!'});
      }
      return;
    }

    if (options.data === 'Information'){
      Bot.sendChatAction();
      Bot.request('answerCallbackQuery', { callback_query_id: cb.id });
      Bot.editMessageKeyboard('<b>ℹ️ Информация</b>', options.message_id, null, {"inline_keyboard": menu[3] });
      return;
    }

    if (options.data === 'MoreInfo'){ //Доп информация
      Bot.sendChatAction();
      if (Bot.getSystemUser().isAdmin || superAdmin.includes(options.chat_id)) {
        try{
          Bot.editMessageKeyboard(getInfoValues(), options.message_id, null, {"inline_keyboard": [[{text: '🏡 Назад', callback_data: 'Information'}]] });
          Bot.request('answerCallbackQuery', { callback_query_id: cb.id });
        }
        catch{
          Bot.request('answerCallbackQuery', { callback_query_id: cb.id, text: '🥺 Данные отсутсвуют!'});
        }
        return;
      }
      else{
        try{
          Bot.editMessageKeyboard(getInfoValues(), options.message_id, null, {"inline_keyboard": [[{text: '🏡 Назад', callback_data: 'menu_start'}]] });
          Bot.request('answerCallbackQuery', { callback_query_id: cb.id });
        }
        catch{
          Bot.request('answerCallbackQuery', { callback_query_id: cb.id, text: '🥺 Данные отсутсвуют!'});
        }
        return;
      }
    }

    if (options.data === 'Articles'){ // архив статей
      Bot.sendChatAction();
      try{
        Bot.editMessageKeyboard('🗂️ <b>Архив статей</b>\n'+getInfoArticles(), options.message_id, null, {"inline_keyboard": [[{text: '🏡 Назад', callback_data: 'Information'}]] });
        Bot.request('answerCallbackQuery', { callback_query_id: cb.id });
      }
      catch{
        Bot.request('answerCallbackQuery', { callback_query_id: cb.id, text: '🥺 Данные отсутсвуют!'});
      }
      return;
    }

    if (options.data === 'schedule'){ //расписание работы
      Bot.sendChatAction();
      if(schedule_msg !== ''){ //если ссылка для расписания имеется
        msg = 'Расписание работы🗒';
        try{
          Bot.editMessageKeyboard(msg, options.message_id, null, {"inline_keyboard": [[{ text: 'Открыть', url: schedule_msg }],[{text: '🏡 Назад', callback_data: 'menu_start'}]] });
        }
        catch{
          Bot.editMessageKeyboard(schedule_msg, options.message_id, null, {"inline_keyboard": [[{text: '🏡 Назад', callback_data: 'menu_start'}]] });
        }
        Bot.request('answerCallbackQuery', { callback_query_id: cb.id});
      }
      else{
        Bot.request('answerCallbackQuery', { callback_query_id: cb.id, text: '🥺 Расписание отсутсвует!'});
      }
      return;
    }

    

    if (options.data === 'loading') { //Пользователь хочет проверить состояние заявки
      Bot.sendChatAction();
      let ind = search_row(options.chat_id, 'users', 2)
      if (ind == undefined){ //если пользователь не зарегистрирован
        Bot.request('answerCallbackQuery', { callback_query_id: cb.id, text: '⚠️ Вы не зарегистрированы!'});
      }
      else{
        let data = getSheetValue('users', ind, 9);
        if (data != ''){ //если состояние заявки присутствует
          Bot.request('answerCallbackQuery', { callback_query_id: cb.id });
          Bot.editMessageKeyboard(`<b>Cостояние заявки:</b> ${String(data)}`, options.message_id, null, {'inline_keyboard': menu[1]});
        }
        else{ //если состояние заявки отсутствует
          Bot.request('answerCallbackQuery', { callback_query_id: cb.id, text: '⚠️ Документов на проверку не отправлялось!'});
        }
      }
      return;
    }

    if (options.data === 'sendWait') {//Пользователь хочет отправить заявку
      Bot.sendChatAction();
      let ind = search_row(options.chat_id, 'users', 2); //индекс пользователя в базе данных
      if (ind == undefined){ //если пользователь не зарегистрирован
        Bot.request('answerCallbackQuery', { callback_query_id: cb.id, text: '⚠️ Вы не зарегистрированы!'});
      }
      else{
        if (getSheetVal('users', ind, 9) === '') {//если заявка не отправлялась
          let category = getSheetVal('users', ind, 10);//категория пользователя - название
          if (category){
            let indCategory = search_row(category, 'Test', 1); 
            let a = Sheet('users').getRange(1, 11, 1, Sheet('users').getLastColumn()-10).getValues().flat();//названия категорий
            let b = Sheet('Test').getRange(indCategory, 2, 1, Sheet('Test').getLastColumn()-1).getValues().flat();//список обязательных документов
            let c = Sheet('users').getRange(ind, 11, 1, Sheet('users').getLastColumn()-10).getValues().flat();//массив с данными пользователя

            const categoriesArr = b //новый список обязательных документов
              .filter(document => document.includes('✅'))
              .map(document => document.slice(2))

            let arr = [];
            for (let i = 0; i < c.length; i++) {//список имеющихся документов у пользователя
              if (c[i]){ //если нет какого-то документа
                arr.push(a[i]);
              }
            }

            const diff = function (a1, a2) {//сравнение двух массивов
              return a1.filter(doc => !a2.includes(doc))
            }

            const diffCategories = diff(categoriesArr, arr);//список с недостающими документами

            if (diffCategories.length) {
              Bot.request('answerCallbackQuery', { callback_query_id: cb.id, text: 'Прочтите сообщение!'});
              msg = `<b>Внимание:</b> после отправки документов на проверку, возможность изменять документы будет заблокирована.\n\n<i>Если согласны, нажмите:</i> <b>Продолжить</b>`;
              Bot.editMessageKeyboard(msg, options.message_id, null, {'inline_keyboard': menu[10]});
            }
            else{
              Bot.request('answerCallbackQuery', { callback_query_id: cb.id, text: 'Прочтите сообщение!'});
              msg = `<b>Внимание:</b> после отправки документов на проверку, возможность изменять документы будет заблокирована.\n\n<i>Если согласны, нажмите:</i> <b>Продолжить</b>`;
              Bot.editMessageKeyboard(msg, options.message_id, null, {'inline_keyboard': menu[11]});
            }
          }

          else{
            Bot.request('answerCallbackQuery', { callback_query_id: cb.id, text: '⚠️ Категория не установлена!'});
            msg = `<b>Прежде, чем отправить заявку для проверки документов, необходимо:\n\n1.</b> Выбрать категорию, к которой Вы принадлежите;\n<b>2.</b> Загрузить все необходимые документы;\n<b>3.</b> Повторно отправить заявку на проверку.`
            keys = [[{'text': '✳️ Установить категорию', 'callback_data': `newCategory`}],
                    [{'text': '📨 Отправить документы', 'callback_data': 'Отправить документы'}],
                    [{'text': '🏡 Назад', 'callback_data': 'menu_start'}]];
            Bot.editMessageKeyboard(msg, options.message_id, null, {'inline_keyboard': keys});
          }
        }
      return;
      }
    }

    if (options.data === 'waiting') { //отправка заявки
      Bot.sendChatAction();
      let ind = search_row(options.chat_id, 'users', 2); //индекс пользователя в базе данных
        
        if (getSheetVal('users', ind, 9) === '') {//если заявка не отправлялась
          let category = getSheetVal('users', ind, 10);//категория пользователя - название
          if (category){
            let indCategory = search_row(category, 'Test', 1); 
            let a = Sheet('users').getRange(1, 11, 1, Sheet('users').getLastColumn()-10).getValues().flat();//названия категорий
            let b = Sheet('Test').getRange(indCategory, 2, 1, Sheet('Test').getLastColumn()-1).getValues().flat();//список обязательных документов
            let c = Sheet('users').getRange(ind, 11, 1, Sheet('users').getLastColumn()-10).getValues().flat();//массив с данными пользователя

            const categoriesArr = b //новый список обязательных документов
              .filter(document => document.includes('✅'))
              .map(document => document.slice(2))

            let arr = [];
            for (let i = 0; i < c.length; i++) {//список имеющихся документов у пользователя
              if (c[i]){ //если нет какого-то документа
                arr.push(a[i]);
              }
            }

            const diff = function (a1, a2) {//сравнение двух массивов
              return a1.filter(doc => !a2.includes(doc))
            }

            const diffCategories = diff(categoriesArr, arr);//список с недостающими документами

            if (diffCategories.length) {//если имеются недостающие документы
              Bot.request('answerCallbackQuery', { callback_query_id: cb.id, text: '⚠️ Не хватает документов!'});
              msg = '<b>Загрузите следующие документы:</b> \n'
              for (let i = 0; i < diffCategories.length; i++) {msg += `<b>${i+1}.</b> ${diffCategories[i]}\n`};//формирование сообщения
              Bot.editMessageKeyboard(msg, options.message_id, null, {'inline_keyboard': menu[9]});
            }

            else{
              Bot.request('answerCallbackQuery', { callback_query_id: cb.id });
              setSheetVal('users', ind, 9, 'Заявка отправлена');
              msg = `<b>✅ Ваша заявка отправлена!</b><i>\nКогда статус изменится, Вам придёт сообщение!</i>`;
              Bot.editMessageKeyboard(msg, options.message_id, null, {'inline_keyboard': menu[1]});
              msg2 = "<b>Босс, новая заявка от " + "<a href='" + Bot.mentionByID() +"'>" + Bot.getUserFullName() + "</a></b>";
              let key = [[{'text': '🔄 Изменить статус заявки', 'callback_data': `setStatus_${options.chat_id}` }],
                        [{'text': '📄 Выгрузить все документы', 'callback_data': `DownloadDocs_${options.chat_id}` }],
                        [{'text': '✉️ Отправить сообщение', 'callback_data': `sendmsg_${options.chat_id}`}]];
              Bot.sendMessageTo(superAdmin[0], msg2, {'reply_markup': {'inline_keyboard': key}});
            }
          }

          else{
            Bot.request('answerCallbackQuery', { callback_query_id: cb.id, text: '⚠️ Категория не установлена!'});
            msg = `<b>Прежде, чем отправить заявку для проверки документов, необходимо:\n\n1.</b> Выбрать категорию, к которой Вы принадлежите;\n<b>2.</b> Загрузить все необходимые документы;\n<b>3.</b> Повторно отправить заявку на проверку.`
            keys = [[{'text': '✳️ Установить категорию', 'callback_data': `newCategory`}],
                    [{'text': '📨 Отправить документы', 'callback_data': 'Отправить документы'}],
                    [{'text': '🏡 Назад', 'callback_data': 'menu_start'}]];
            Bot.editMessageKeyboard(msg, options.message_id, null, {'inline_keyboard': keys});
          }
        }

        else{//если заявка уже отправлялась ранее
          Bot.request('answerCallbackQuery', { callback_query_id: cb.id, text: '⚠️ Заявка уже отправлялась ранее!'});
          msg = `<b>⚠️ Заявка уже отправлялась ранее!</b> \n<i>Будьте терпеливы, Ваша заявка уже на рассмотрении.\nКогда статус изменится, Вам придёт сообщение!</i>`;
          Bot.editMessageKeyboard(msg, options.message_id, null, {'inline_keyboard': menu[1]});
        }
      return;
    }

    if (options.data === 'Instructions') {
      Bot.request('answerCallbackQuery', { callback_query_id: cb.id, text: '📋 Инструкции'});
      userProperties.setProperty(options.chat_id, JSON.stringify({callback_query_data: options.data}));
      let data = getDataColumnSheet('Instructions');
      msg = '<b>Выберите любую статью из приведенного ниже списка </b>👇';
      try{
        Bot.editMessageKeyboard(msg, options.message_id, null, keySheets(data, undefined, return_key = "Information").keyboard); 
        return;
      }
      catch{//если не получается изменить сообщение для возврата назад
        Bot.deleteMessage(options.message_id);
        Bot.sendMessage(msg, {'reply_markup': keySheets(data, undefined, return_key = "Information").keyboard});
        return;
      }
    }

    if (options.data === 'Удалить материал' || options.data === 'Добавить материал' || options.data === 'Посмотреть документы') {
      let user = {callback_query_data: options.data};
      if (options.data === 'Посмотреть документы') {
        let data = getDataUsers();
        if(data.length > 0){//проверка на наличие пользователей
          msg = msg = '<b>Выбери пользователя, которого Вы хотите посмотреть</b>👇';
          userProperties.setProperty(options.chat_id, JSON.stringify(user));
          Bot.editMessageKeyboard(msg, options.message_id, null, keySheets(getDataUsers(), undefined).keyboard);
          Bot.request('answerCallbackQuery', { callback_query_id: cb.id});
        }
        else{
          Bot.request('answerCallbackQuery', { callback_query_id: cb.id, text: '🥺 Здесь пусто!' });
        }
        return;
      }

      if (options.data === 'Добавить материал') {
        userProperties.setProperty(options.chat_id, JSON.stringify(user));
        Bot.editMessageText('<b>Пришлите Ваш новый материал.</b>', options.message_id);
        Bot.request('answerCallbackQuery', { callback_query_id: cb.id});
      }

      if (options.data === 'Удалить материал') {
        let data = getDataColumnSheet('Instructions');
        msg = 'Выбери предмет, в котором Вы хотите <b>удалить</b> материал👇';
        userProperties.setProperty(options.chat_id, JSON.stringify(user));
        Bot.editMessageKeyboard(msg, options.message_id, null, keySheets(data, undefined, return_key = "menu_start").keyboard);
        Bot.request('answerCallbackQuery', { callback_query_id: cb.id});
      }
      else{
        Bot.request('answerCallbackQuery', { callback_query_id: cb.id, text: '🥺 Здесь пусто!' });
      }
      return;       
    }

    if (Bot.getUsersID().includes(+options.data)) {//если выбран юзер из списка
      Bot.request('answerCallbackQuery', { callback_query_id: cb.id, text: 'Загружаю список пользователей' });
      let keys = [[{'text': '🔄 Изменить статус заявки', 'callback_data': `setStatus_${+options.data}` }],
                  [{'text': '🗑️ Удалить статус заявки', 'callback_data': `delStatus_${+options.data}` }],
                  [{'text': '📄 Выгрузить все документы', 'callback_data': `DownloadDocs_${+options.data}` }],
                  [{'text': '✉️ Отправить сообщение', 'callback_data': `sendmsg_${options.data}`}],
                  [{'text': '🏡 Назад', 'callback_data': 'Посмотреть документы'}]];
      msg = Bot.getSystemUser(options.data).firstName +' '+ Bot.getSystemUser(options.data).lastName
      Bot.editMessageKeyboard(`<b>${msg}</b>` , options.message_id, null, {'inline_keyboard': keys});
      return;
    }

    if (options.data === 'Добавить категорию') {
      Bot.request('answerCallbackQuery', { callback_query_id: cb.id, text: 'Введите название категории' });
      userProperties.setProperty(options.chat_id, JSON.stringify({callback_query_data: options.data}));
      Bot.editMessageText('<b>Напишите название для Вашей новой категории.</b>', options.message_id);
      return;
    }

    if (options.data === 'Удалить категорию') {
      userProperties.setProperty(options.chat_id, JSON.stringify({callback_query_data: options.data}));
      if (getSheetVal('Test', 1, 1)) {
        Bot.request('answerCallbackQuery', { callback_query_id: cb.id, text: 'Выберите категорию!' });
        let categories = getDataColumnSheet('Test');
        msg = '<b>Выберите категорию, которую Вы хотите удалить</b>👇'
        Bot.editMessageKeyboard( msg, options.message_id, null, keySheets(categories, undefined, return_key = "Functions").keyboard);
        return;
      }
      else{
        Bot.request('answerCallbackQuery', { callback_query_id: cb.id, text: '🥺 Категории отсутствуют!' });
        return;
      }
    }

    if (options.data === 'Добавить документ') {
      Bot.request('answerCallbackQuery', { callback_query_id: cb.id, text: 'Введите название документа' });
      userProperties.setProperty(options.chat_id, JSON.stringify({callback_query_data: options.data}));
      Bot.editMessageText('<b>Напишите название нового документа.</b>', options.message_id);
      return;
    }

    if (options.data.split('_')[0] === 'sendmsg') { //отпрака сообщения от имени бота пользователю
      Bot.request('answerCallbackQuery', { callback_query_id: cb.id, text: 'Отправка сообщения пользователю'});
      userProperties.setProperty(options.chat_id, JSON.stringify({callback_query_data: options.data}));
      msg = '<b>Напишите Ваше сообщение, которое Вы хотите отправить пользовтателю.</b>👇';
      Bot.sendMessage(msg);
      return;
    }

    if (options.data === 'sendmsgAdmin') { //отпрака сообщения администратору
      Bot.request('answerCallbackQuery', { callback_query_id: cb.id, text: 'Отправка сообщения администратору' });
      userProperties.setProperty(options.chat_id, JSON.stringify({callback_query_data: options.data}));
      msg = '<b>Напишите Ваше сообщение, которое Вы хотите отправить администратору.</b>👇';
      Bot.editMessageKeyboard( msg, options.message_id, null, {'inline_keyboard': [[{'text': '🏡 Назад', 'callback_data': 'menu_start'}]]});
      return;
    }

    if (options.data === 'sendAllmsg') { //отпрака сообщения от имени бота всем пользователям
      Bot.request('answerCallbackQuery', { callback_query_id: cb.id, text: 'Отправка сообщения пользователям' });
      userProperties.setProperty(options.chat_id, JSON.stringify({callback_query_data: options.data}));
      msg = '<b>Напишите Ваше сообщение, которое Вы хотите отправить всем пользовтателям.</b>👇';
      Bot.editMessageKeyboard( msg, options.message_id, null, {'inline_keyboard': [[{'text': '🏡 Назад', 'callback_data': 'sendmsg'}]]});
      return;
    }

    if (options.data === 'sendAllmsgTo') { //отпрака сообщения от имени бота всем пользователям
      Bot.request('answerCallbackQuery', { callback_query_id: cb.id, text: 'Выберите категорию👇' });
      let categories = getDataColumnSheet('Test');
      msg = '<b>Выберите категорию, которой Вы хотите отправить Ваше сообщение.</b>';
      userProperties.setProperty(options.chat_id, JSON.stringify({callback_query_data: `sendAllmsgTo`}));
      Bot.editMessageKeyboard( msg, options.message_id, null, keySheets(categories, undefined, return_key = "sendmsg").keyboard);
      return;
    }

              /*                          АДМИНИСТРАТОРСКИЕ ФУНКЦИИ                           */

    if(options.data === 'Functions') {
      Bot.sendChatAction();
      Bot.request('answerCallbackQuery', { callback_query_id: cb.id});
      msg = "<b>Вы в главном МЕНЮ:</b>\n\n<i>выберите любой вариант из приведенного ниже списка.</i>";
      Bot.editMessageKeyboard(msg, options.message_id, null, {'inline_keyboard': menu[8]});
      return;
    }

    if (options.data === 'Добавить расписание'){
      let user = {
        callback_query_data: 'Добавить расписание',
      };
      userProperties.setProperty(options.chat_id, JSON.stringify(user));
      Bot.editMessageKeyboard('<b>Пришлите расписание или прямую ссылку на Ваше расписание</b>', options.message_id, null, {'inline_keyboard': menu[1]});
      Bot.request('answerCallbackQuery', { callback_query_id: cb.id});
      return;
    }

    if (options.data === 'Удалить расписание'){
      if (schedule_msg.trim() == '') { //если ссылка для расписания имеется
        Bot.request('answerCallbackQuery', { callback_query_id: cb.id, text: '⚠️ Расписание отсутсвует!'});
      }
      else {
        setSheetVal('Settings', 2, 2, '');//установка в графу с расписанием пустого значения
        Bot.request('answerCallbackQuery', { callback_query_id: cb.id, text: '✅ Расписание успешно удалено!'});
      }
      return;
    }

    if (options.data.includes('setStatus')) {
      Bot.sendChatAction();
      Bot.request('answerCallbackQuery', { callback_query_id: cb.id, text: 'Выберите статус' });
      userProperties.setProperty(options.chat_id, JSON.stringify({callback_query_data: options.data}));
      msg = '<b>Босс, выберите любой вариант из приведенного ниже списка.</b>';
      keys = getDataColumnSheet('Settings', row=2,col=4);
      Bot.sendMessageCustomKeyboard(msg, keys, 'Босс, выбери статус!');
      return;
    }

    if (options.data.includes('delStatus')) {
      Bot.sendChatAction();
      Bot.request('answerCallbackQuery', { callback_query_id: cb.id, text: 'Выберите статус' });
      let ind = search_row(userData.callback_query_data.split('_')[1], 'users', 2);
      msg = '✅<b>Cтатус успешно изменён.</b> \n\n<i>Используйте: /start, чтобы снова перейти в главное меню</i>';
      Bot.sendMessage(msg);
      setSheetVal('users', ind, 9, '');
      msg2 = `✉️<b>Статус Вашей заявки обновлён:</b> \n<i>Текущий статус:</i> <b>${text}\n\nС уважением, отдел опеки г.Уфа</b>`;
      Bot.sendMessageTo(userData.callback_query_data.split('_')[1], msg2);
      return;
    }

    if (options.data.includes('newCategory')) {
      Bot.request('answerCallbackQuery', { callback_query_id: cb.id, text: 'Выберите категорию!' });
      userProperties.setProperty(options.chat_id, JSON.stringify({callback_query_data: 'setCategory'}));
      msg = '<b>Установите категорию из приведённого ниже списка👇</b>';
      let categories = getDataColumnSheet('Test');
      Bot.editMessageKeyboard(msg, options.message_id, null, keySheets(categories, undefined, return_key = "menu_start").keyboard);
      return;
    }

    if (options.data === 'editDocs') { //если нажата кнопка для изменения документов по умолчанию
      Bot.sendChatAction();
      Bot.request('answerCallbackQuery', { callback_query_id: cb.id});
      userProperties.setProperty(options.chat_id, JSON.stringify({callback_query_data: options.data}));
      let categories = getDataColumnSheet('Test');//категории
      msg = '<b>Выберите категорию, в которой Вы хотите изменить документы</b>👇'
      Bot.editMessageKeyboard( msg, options.message_id, null, getkeys(categories, 2, return_key = "Functions"));
      return;
    }

    if (options.data === 'editDocsSendAll') {//отправка уведомления пользователям об изменении категории
      Bot.sendChatAction();
      Bot.request('answerCallbackQuery', { callback_query_id: cb.id});
      let category = userData.callback_query_data.split('_')[1];
      let users = getDataColumnSheet('users', 2, 2);
      let ind = search_row(category, 'Test', 1); //строка сохранённой категории 
      let docs = getDataRowSheet('Test', ind, 2).filter(document => document.includes('✅'));//список обязательных документов
      let txt = `⚠️ Внимание, список документов в категории:<b> ${category}</b> был изменён!\n\n<b>Текущий список:</b>\n`;
      for (i in docs) {txt+=`${docs[i]}\n`};
      for (i in users) {
        Bot.sendMessageTo(users[i], txt);
      }
      msg2 = `Проинформировано: <b>${+i+1}</b> из <b>${users.length}</b>`;
      Bot.sendMessage(msg2);
      return;
    }

    if (options.data >= 0) {//изменение документов по умолчанию
      Bot.sendChatAction();
      Bot.request('answerCallbackQuery', { callback_query_id: cb.id});
      if (userData.callback_query_data.includes('editDocs') ) {
        let ind = search_row(userData.callback_query_data.split('_')[1], 'Test', 1); //Cтрока выбранной категории
        let docs = getDataRowSheet('Test', ind, 2);
        if (docs[options.data].split(' ')[0] == '✅') {
          msg = docs[options.data].replace(/✅/, '➖')
        }
        else {
          msg = docs[options.data].replace(/➖/, '✅')
        }
        setSheetVal('Test', ind, +options.data+2, msg);
        docs = getDataRowSheet('Test', ind, 2);//обновление переменной docs
        Bot.editMessageKeyboard(`Ваш Выбор: <b>${msg}</b> сохранён!` , options.message_id, null,  getkeys(docs, 1, "Functions", `editDocsSendAll`));
        return;
      }
    }
    
    if (getDataColumnSheet('Test').includes(options.data)) { //если выбрана категория
      Bot.sendChatAction();
      if (userData.callback_query_data === 'editDocs') { //если выбрана категория для изменения документов по умолчанию
        Bot.request('answerCallbackQuery', { callback_query_id: cb.id});
        let ind = search_row(options.data, 'Test', 1); //Cтрока выбранной категории
        let docs = getDataRowSheet('Test', ind, 2);
        msg = '<b>Выберите документ, который Вы хотите изменить</b>👇'
        userProperties.setProperty(options.chat_id, JSON.stringify({callback_query_data: `editDocs_${options.data}`}));
        Bot.editMessageKeyboard( msg, options.message_id, null, getkeys(docs, 1, "Functions", `editDocsSendAll`));
        return;
      }

      if (userData.callback_query_data === 'sendAllmsgTo') { //если выбрана категория для отправки сообщения категории пользователей
        Bot.request('answerCallbackQuery', { callback_query_id: cb.id, text: 'Отправка сообщения пользователям' });
        msg = '<b>Напишите Ваше сообщение, которое Вы хотите отправить пользовтателям.</b>👇';
        userProperties.setProperty(options.chat_id, JSON.stringify({callback_query_data: `sendAllmsgTo_${options.data}`}));
        Bot.editMessageKeyboard( msg, options.message_id, null, {'inline_keyboard': [[{'text': '🏡 Назад', 'callback_data': 'sendmsg'}]]});
        return;
      }

      if (userData.callback_query_data === 'Удалить категорию') { //если выбрана категория для удаления
        try{
          Sheet('Test').deleteRow(search_row(options.data, 'Test', 1));
          Bot.request('answerCallbackQuery', { callback_query_id: cb.id, text: '✅ Категория успешно удалена!' });
          let categories = getDataColumnSheet('Test');
          msg = '<b>Выберите категорию, которую Вы хотите удалить</b>👇'
          Bot.editMessageKeyboard( msg, options.message_id, null, keySheets(categories, undefined, return_key = "Functions").keyboard);
        }
        catch{
          Bot.request('answerCallbackQuery', { callback_query_id: cb.id, text: '🥺 Произошла ошибка!' });  
        }
        return;
      }

      if (userData.callback_query_data === 'setCategory') { //если выбрана категория для установки
        if (!superAdmin.includes(options.chat_id)){
          try {
            let ur = search_row(options.chat_id, 'users', 2);
            setSheetVal('users', ur, 10, options.data); //установка категории
            Bot.request('answerCallbackQuery', { callback_query_id: cb.id, text: '✅ Категория успешно установлена!'});
            userProperties.setProperty(options.chat_id, JSON.stringify({callback_query_data: 'Отправить документы'}));
            msg = '<b>Выберите документ из приведённого ниже списка👇</b>';
            Bot.editMessageKeyboard(msg, options.message_id, null, getkeyFlags(options.chat_id, return_key = "menu_start"));
            return
          }
          catch{
            Bot.request('answerCallbackQuery', { callback_query_id: cb.id, text: '🥺 Произошла ошибка!' });
            return;
          }
        }
        return;
      }
    }

     /*                          РАБОТА С ДОКУМЕНТАМИ                           */

    if (options.data === 'Отправить документы') { //отправка документов

      let ind = search_row(options.chat_id, 'users', 2);//строка пользователя в таблице
      if (getSheetVal('users', ind, 9) !== '') {//если заявка уже отправлялась
        Bot.sendChatAction();
        Bot.request('answerCallbackQuery', { callback_query_id: cb.id, text: '⚠️ Отправка документов запрещена' });
        msg = "<b>Вы в главном МЕНЮ:</b>\n\n<i>выберите любой вариант из приведенного ниже списка.</i>";
        Bot.editMessageKeyboard(msg, options.message_id, null, {'inline_keyboard': menu[0].slice(2)});
      }

      else{
        if (getSheetVal('users', ind, 10) !== '') {//если категория граждан в таблице имеется
          Bot.request('answerCallbackQuery', { callback_query_id: cb.id, text: 'Отправка документов' });
          userProperties.setProperty(options.chat_id, JSON.stringify({callback_query_data: options.data}));
          msg = '<b>Выберите документ из приведённого ниже списка👇</b>';
          Bot.editMessageKeyboard(msg, options.message_id, null, getkeyFlags(options.chat_id, return_key = "menu_start"));
          return;
        }
        else {//если пользователь не выбрал категорию
          Bot.request('answerCallbackQuery', { callback_query_id: cb.id, text: 'Выберите категорию!' });
          userProperties.setProperty(options.chat_id, JSON.stringify({callback_query_data: 'setCategory'}));
          msg = '<b>Установите категорию из приведённого ниже списка👇</b>';
          let categories = getDataColumnSheet('Test');
          Bot.editMessageKeyboard(msg, options.message_id, null, keySheets(categories, undefined, return_key = "menu_start").keyboard);
          return;
        }
      }
    }

    let passlist = Sheet('Users').getRange(1, 11, 1, Sheet('Users').getLastColumn()-10).getValues().flat();
    if (passlist.includes(options.data)) { //если выбран документ из списка
      
      if (userData.callback_query_data === 'Отправить документы') {
        Bot.request('answerCallbackQuery', { callback_query_id: cb.id, text: `Отправьте: ${options.data}`});
        userProperties.setProperty(options.chat_id, JSON.stringify({callback_query_data: `sendoc_${options.data}`}));
        let ur = search_row(options.chat_id, 'users', 2);//строка пользователя
        let dcol = search_col(options.data, 'users', 1);//колонка надйенного документа
        if (getSheetVal('users', ur, dcol) === '') {//если документ уже имеется в списке
          msg = '<b>Пришлите Ваш документ в ответном сообщении.</b> \n\n<i>Поддерживаются следующие форматы</i> \n <b>| PDF | DOC | JPEG | JPG | PNG |</b>';
          let key = [[{ text: '🏡 Назад', callback_data: 'Отправить документы'}]];
          Bot.editMessageKeyboard(msg, options.message_id, null, {'inline_keyboard': key });
          return;
        }
        else{
          msg = '<b>Данный документ уже есть в системе.</b> \nЧтобы заменить документ, пришлите Ваш новый документ в ответном сообщении. \n\n<i>Поддерживаются следующие форматы</i> \n <b>| PDF | DOC | JPEG | JPG | PNG |</b>';
          let key = [
            [{ text: 'Удалить документ', callback_data: `deleteDoc_${options.data}`}],
            [{ text: '🏡 Назад', callback_data: 'Отправить документы'}]
          ]
          Bot.editMessageKeyboard(msg, options.message_id, null, {'inline_keyboard': key });
          return;
        }
      }
    }

    if (options.data.includes('deleteDoc')) { //удаление документа из меню пользователя, до подачи заявки
      let ur = search_row(options.chat_id, 'users', 2);
      let dcol = search_col(options.data.split('_')[1], 'users', 1);
      setSheetVal('users', ur, dcol, null);
      Bot.request('answerCallbackQuery', { callback_query_id: cb.id, text: `✅Документ успешно удалён.` });
      Bot.deleteMessage(options.message_id);
      msg = `✅Документ: <b>${userData.callback_query_data.split('_')[1]}</b> успешно удалён.`;
      Bot.sendMessage(msg);
      msg2 = '<b>Выберите документ из приведённого ниже списка👇</b>';
      userProperties.setProperty(options.chat_id, JSON.stringify({callback_query_data: 'Отправить документы'}));
      Bot.sendMessage(msg2, {'reply_markup': getkeyFlags(options.chat_id, return_key = "menu_start")});
      return;
    }

    if (options.data === 'delete'){
      Bot.deleteMessage(TelegramJSON.callback_query.message.message_id);
      Bot.request('answerCallbackQuery', { callback_query_id: cb.id});
      return;
    }

    if (options.data.includes('DownloadDocs')) { //выгрузка всех документов пользователя
      Bot.sendChatAction();
      Bot.request('answerCallbackQuery', { callback_query_id: cb.id });
      let userID = options.data.split('_')[1];
      let ind = search_row(userID, 'users', 2); //индекс пользователя в базе данных
      let usersDocs = Sheet('users').getRange(ind, 11, 1, Sheet('Users').getLastColumn()-10).getValues().flat();
      let data1 = Sheet('users').getRange(1, 11, 1, Sheet('Users').getLastColumn()-10).getValues().flat();
      Bot.sendMessage("<b>Начало выгрузки для <a href='tg://user?id=" + userID +"'>" + [Bot.getSystemUser(userID).firstName +' '+Bot.getSystemUser(userID).lastName] + "</a></b>");
      for (let i = 0; i < usersDocs.length; i++) {
        if (usersDocs[i]) {
          msg = "<b>" + data1[i] + "</b> <a href='tg://user?id=" + userID +"'><b>" + [Bot.getSystemUser(userID).firstName +' '+Bot.getSystemUser(userID).lastName] + "</b></a>";
          try{
            Bot.sendPhoto(msg, usersDocs[i]);
          }
          catch{
            Bot.sendDocument(msg, usersDocs[i]);
          }
        }
      }
      Bot.sendMessage("<b>Выгрузка завершена для <a href='tg://user?id=" + userID +"'>" + [Bot.getSystemUser(userID).firstName +' '+Bot.getSystemUser(userID).lastName] + "</a></b>");
      return;
    }

                 /*                          ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ                           */

    if (getDataColumnSheet('Instructions').includes(options.data)) {//если пользователь выбрал материал в боте
      Bot.request('answerCallbackQuery', { callback_query_id: cb.id, text: options.data});
      
      if (userData.callback_query_data === 'Удалить материал') {//если пользователь желает удалить материал
        Bot.request('answerCallbackQuery', { callback_query_id: cb.id, text: 'Удаляю материал'});
        Sheet("Instructions").deleteRow(search_row(options.data, "Instructions", 1));
        let data = getDataColumnSheet("Instructions");
        msg = 'Выбери материал, который Вы хотите <b>удалить</b>👇';
        Bot.editMessageKeyboard(msg, options.message_id, null, keySheets(data, undefined, return_key = 'menu_start').keyboard);
        return;
      }
      
      if(userData.callback_query_data === 'Instructions'){
        //Bot.request('answerCallbackQuery', { callback_query_id: cb.id, text: 'Поиск материала'});
        let row = search_row(options.data, 'Instructions', 1);
        let lastpost = Sheet('Instructions').getRange(row, 1, 1,  4).getValues()[0];
        Bot.request('answerCallbackQuery', { callback_query_id: cb.id});
        msg = '<b>🔎' + lastpost[0] + '</b>' + '\n\n'+ lastpost[1];
        if (lastpost[3] == 'Текст') {
          Bot.editMessageKeyboard(msg, options.message_id, null, {'inline_keyboard': menu[7]}, {'disable_web_page_preview': false});
          return;
        }
        if (lastpost[3] == 'Изображение') {
          Bot.deleteMessage(options.message_id);
          Bot.sendPhoto(msg, lastpost[2], menu[7], {'disable_web_page_preview': false});
          return;
        }
        if (lastpost[3] == 'Видео') {
          Bot.deleteMessage(options.message_id);
          Bot.sendVideo(msg, lastpost[2], menu[7], {'disable_web_page_preview': false});
          return;
        }
        if (lastpost[3] == 'Аудио') {
          Bot.deleteMessage(options.message_id);
          Bot.sendAudio(msg, lastpost[2], menu[7], {'disable_web_page_preview': false});
          return;
        }
        if (lastpost[3] == 'Документ') {
          Bot.deleteMessage(options.message_id);
          Bot.sendDocument(msg, lastpost[2], menu[7], {'disable_web_page_preview': false});
          return;
        }
      }
    }

    if (options.data.includes('user') ) {//авторизация пользователя
      if (options.data.includes('approve') ) {//принятие авторизации
        let idn = options.data.split('_')[2];
        Bot.authSystemUser(idn, true)
        msg  = "<i>Вы были авторизованы.</i> Приятного пользования!";
        msg2 = "Запрос от <a href='tg://user?id="+options.data.split('_')[2] + "'>"+options.data.split('_')[2]+"</a> был <b>одобрен</b> вами.";
        Bot.sendMessage(msg, { chat_id: options.data.split('_')[2] });
        Bot.sendMessage(welcome_msg, { chat_id: options.data.split('_')[2] });
      }
      if ( options.data.includes('deny') ) {//отклонение авторизации
        Bot.authSystemUser(options.data.split('_')[2], false);
        msg  = "<i>К сожалению, Ваш запрос был отклонен!</i>";
        msg2 = "Запрос от <a href='tg://user?id="+options.data.split('_')[2] + "'>"+options.data.split('_')[2]+"</a> был <b>отклонен</b> вами.";
        Bot.sendMessage(msg, { chat_id: options.data.split('_')[2] });
      }
      Bot.editMessageText(msg2, options.message_id);
      Bot.request('answerCallbackQuery', { callback_query_id: cb.id});
      return;
    }

    if (options.data.includes('page')) {//если нажата кнопка перелистнуть страницу в любом из списков
      let page = options.data.substr(5);
      let x = userData.callback_query_data;
      Bot.request('answerCallbackQuery', { callback_query_id: cb.id });
      switch(x) {
        
        case 'Посмотреть документы':
          msg = '<b>Выбери пользователя, которого Вы хотите посмотреть</b>👇';
          data = getDataUsers("users");
          Bot.editMessageKeyboard(msg, options.message_id, null, keySheets(data, page, return_key = "menu_start").keyboard);
          break;
        
        case 'sendAllmsgTo':
          msg = 'Выберите категорию, которой Вы хотите <b>отправить сообщение</b>👇';
          data = getDataColumnSheet('Test');
          Bot.editMessageKeyboard(msg, options.message_id, null, keySheets(data, page, return_key = 'sendmsg').keyboard);
          break;

        case 'Instructions':
          msg = '<b>Выберите любую статью из приведенного ниже списка</b>👇';
          data = getDataColumnSheet('Instructions');
          Bot.editMessageKeyboard(msg, options.message_id, null, keySheets(data, page, return_key = 'Information').keyboard, {'disable_web_page_preview': true});
          break;

        case 'Удалить категорию':
          msg = 'Выберите категорию, которую Вы хотите <b>удалить</b>👇';
          data = getDataColumnSheet('Test');
          Bot.editMessageKeyboard(msg, options.message_id, null, keySheets(data, page, return_key = "Functions").keyboard);
          break;
        
        case 'setCategory':
          msg = 'Выберите категорию, которую Вы хотите <b>установить</b>👇';
          data = getDataColumnSheet('Test');
          Bot.editMessageKeyboard(msg, options.message_id, null, keySheets(data, page, return_key = "Functions").keyboard);
          break;
        
        case 'Удалить материал':
          msg = 'Выбери материал, который Вы хотите <b>удалить</b>👇';
          data = getDataColumnSheet('Instructions');
          Bot.editMessageKeyboard(msg, options.message_id, null, keySheets(data, page, return_key = "Functions").keyboard);
          break;
      
        default:
          Bot.request('answerCallbackQuery', { callback_query_id: cb.id, text: 'Произошла какая-то ошибка'});//ответный запрос, чтобы не было зацикливаний
          break;
      }
      return;
    }
  }

  else{//если пользователь не зарегистрирован в боте
    msg = "Вы не зарегестрированы. \n<i>Пожалуйста, нажмите /addme, чтобы отправить запрос на авторизацию.</i>";
    Bot.sendMessage(msg);
    Bot.request('answerCallbackQuery', { callback_query_id: cb.id});
    return;
  }
}
