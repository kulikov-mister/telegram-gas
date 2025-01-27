function msgChatText(TelegramJSON) {//функция для обработки сообщений в  групповом чате
  let text = TelegramJSON.message.text;
  if (!Bot.isNewChatMember()) { //если сообщения не о новом участнике
    if (Bot.isReply()) { //если пересланное сообщение
      let chat_idReply = TelegramJSON.message.reply_to_message.from.id;
      let first_nameReply = TelegramJSON.message.reply_to_message.from.first_name;
      let last_nameReply = TelegramJSON.message.reply_to_message.from.last_name;
      let usernameReply = TelegramJSON.message.reply_to_message.from.username;
      user = getUserInfo(first_nameReply, last_nameReply, usernameReply);
      let usetReply = user.username;
      let chatName = TelegramJSON.message.reply_to_message.chat.title;
      if (user.username == '') usetReply = user.first_name + ' ' + user.last_name;
      if (matchesThanks(text).length !== 0) {
        if (TelegramJSON.message.reply_to_message.from.is_bot) {
          msg = '<b>Приятно, когда меня хвалят!</b>🙈\n<i>Я умею раздавать карму другим😍</i>';
          Bot.sendMessage(msg);
          return
        }
        if (Bot.getUserID() == chat_idReply) {
          msg = 'Ха... Себе карму хочешь повысить? 😜 Ну-ну...\nПомогай другим в чате и карма быстро вырастит';
          Bot.sendMessage(msg);
          return
        }
        let usetReplyFullName = user.first_name + user.last_name;
        msg = `🎉 <b><a href='tg://user?id=${chat_idReply}'>${usetReply}</a></b> тебе прилетел +1 к карме от <b>${TelegramJSON.message.from.first_name + TelegramJSON.message.from.last_name}</b>\nТекущая карма: <b> ${setCarma(usetReplyFullName, chat_idReply, chatName)}</b>`;
        let trophy = getTrophy(chat_idReply);
        if (trophy != false) msg += '\nТрофей:' + trophy
        Bot.sendMessage(msg);
        return;
      }
    }
    if (!Bot.isReply()) { //если непересланное сообщение содержит благодарность
      if (matchesThanks(text).length !== 0) {
        msg= `<a href='${Bot.mentionByID()}'>${Bot.getUserFirstName()}</a>, чтобы поблагодарить участника чата, ответь на его сообщение, так я смогу повысить его карму.😌`
        Bot.sendMessage(msg);
        return;
      }
    }
  }
  if (Bot.isNewChatMember()) { // если новый пользователь в чате
    namemsg = `<b>🎉 ${Bot.getUserFullName()}</b>, добро пожаловать`
    let msg = `<b>${Bot.getUserFirstName()}</b>, ты в чате!\nСейчас ты можешь пользоватся только поиском.🔍\n📝 <b>Чтобы писать в чат</b>, необходимо ознакомится с правилами чата.🧾`
    let keyBoard = {
      "inline_keyboard": [
        [{ "text": "Правила чата", 'callback_data': 'riding_rules'}]],
      "resize_keyboard": true}
    let options = {
      chat_id: TelegramJSON.message.chat.id,
      user_id: TelegramJSON.message.from.id,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      disable_notification: true,
      reply_markup: keyBoard,
      permissions: {
        can_send_messages: false,
        can_invite_users: true
      },
      until_date: ~~(Date.now()/100) + 604800
    }
    Bot.restrictChatMember(options.chat_id, options.user_id, options.permissions, options.until_date);
    resp = Bot.sendMessage(msg, options);
    let cache = CacheService.getScriptCache();
    let data = {
      chat_id: resp.result.chat.id,
      message_id: resp.result.message_id,
      text: namemsg + '<b>!</b>'
    }
    cache.put(options.user_id, JSON.stringify(data), 21600);
    return;
  }
  if(text === '/rules' || text === '/rules@docs_opeka_bot'){//команда для правил
    Bot.deleteMessage(TelegramJSON.message.message_id);
    Bot.sendMessage(rules);
    return;
  }

  if(text === '/top' || text === '/top@docs_opeka_bot'){//команда для топлиста
    if (leaderBoard()) {
      let msg = leaderBoard();
      Bot.deleteMessage(TelegramJSON.message.message_id);
      Bot.sendMessage(msg);
      return;
    }
    else{
      Bot.deleteMessage(TelegramJSON.message.message_id);
      return;
    }
  }
}