function callbackQueryChat(TelegramJSON) {//обработка нажатий в чатах
  let options = {
    chat_id: TelegramJSON.callback_query.message.chat.id,
    message_id: TelegramJSON.callback_query.message.message_id,
    data: TelegramJSON.callback_query.data,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    disable_notification: true,
    text: '' || TelegramJSON.callback_query.message.text,
    reply_markup: '',
  }
  if (options.data == 'riding_rules') {
    Bot.editMessageKeyboard(rules, options.message_id, options.chat_id, {'inline_keyboard': [[{'text': '☑️ Принять', 'callback_data': `agreeRules_${TelegramJSON.callback_query.from.id}`}]]});
    Bot.request('answerCallbackQuery', {callback_query_id: TelegramJSON.callback_query.id});
    return;
  }

  if (options.data.split('_')[0] == 'agreeRules') {
    let option = {
      user_id: TelegramJSON.callback_query.from.id,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      disable_notification: true,
      permissions: {
        can_send_messages: true,
        can_send_media_messages: true,
        can_send_polls: true,
        can_send_other_messages: true,
        can_add_web_page_previews: true,
        can_invite_users: true,
      }
    }
    if (options.data.split('_')[1] == option.user_id) {
      let cache = CacheService.getScriptCache();
      let cacheData = JSON.parse(cache.get(TelegramJSON.callback_query.from.id));

      if (cacheData !== null) {
        option.chat_id = cacheData.chat_id
        option.message_id = cacheData.message_id
        option.parse_mode = 'HTML',
        option.text = cacheData.text
        Bot.editMessageKeyboard(option.text, option.message_id, option.chat_id, {"inline_keyboard": menu[6],"resize_keyboard": true});
      }

      Bot.restrictChatMember(options.chat_id, option.user_id, option.permissions, null);
      
      let ind = search_row(option.user_id, 'users', 2); //индекс пользователя в базе данных
      if(ind){
        let date = Utilities.formatDate(new Date(), "GMT", "dd.MM.yyyy")
        let val = [date,option.user_id,'@'+TelegramJSON.callback_query.from.username,TelegramJSON.callback_query.from.first_name,TelegramJSON.callback_query.from.last_name,date]
        setSheetValues('users', val);
      }
      answer = {
        callback_query_id: TelegramJSON.callback_query.id,
        text: '✅ Теперь можешь писать в чат 📝',
        show_alert: true
      }
      Bot.request('answerCallbackQuery',answer);
      return;
    }
    else{
      Bot.request('answerCallbackQuery', { callback_query_id: TelegramJSON.callback_query.id, text: 'Это не ваша Кнопка', show_alert: true });
      return;
    }
  }

  if (options.data == 'pass') {
    try{
      Bot.request('answerCallbackQuery',answer);
    }
    catch{
      Bot.request('answerCallbackQuery', { callback_query_id: TelegramJSON.callback_query.id, text: '✅ Теперь можешь писать в чат 📝', show_alert: true });
    }
    return;
  }
  
  else{//остальные нажатия кнопок отрабатываются внутри бота
    return callbackQuery(TelegramJSON);
  }
}