const tgBotToken = "//Токен Бота"; //Токен Бота
const botSheet   = '1T6jvluerVUrSbVNV2EAxJczCLywVY5rM_TfL_gbCwu4';
const superAdmin = [ID админа]; //ID админа
const webAppURL  = 'https://script.google.com/macros/s/AKfycbxA-j_m9FFowNyPp7wCJZFjvbb3Cu_3hjDB52_z7CjFpGtPSCupCvtn32K1k9DGYqtTCQ/exec';

let PROGRAM_NAME = "Telegram бот для взаимодействия с Вашими учащимися"
let DATE_CURRENT = new Date().toLocaleDateString('Ru')
let VERSION = "<b>1.2.1</b>"

function setWebHook() {
  let payload = { url: webAppURL };
  let response = Bot.request('setWebhook', payload);
  Logger.log(JSON.stringify(response));
}

function deleteWebHook() {
  let payload = { url: webAppURL };
  let response = Bot.request('deleteWebhook', payload);
  Logger.log(JSON.stringify(response));
}

function oneTimeSetup() {
  Bot.settingUpBotSheet();
}

function scheduleClearTmp_() {
  Bot.cleanUpBotTmpData();
}

function scheduler() {
  ScriptApp.newTrigger('scheduleClearTmp_').timeBased().everyDays(1).atHour(4).nearMinute(5).inTimezone("Asia/Yekaterinburg").create();
}

function doGet(e) {
}

const rules = `
<b>#ПравилаЧата</b>

ℹ️ если Вы подписались на этот чат, Вы автоматически соглашаетесь с правилами.

ℹ️ чат для тех, кто <b>хочет облегчить себе работу в оформлении документов</b> и <b>ищет обмен опытом и знаниями.</b>

----
⚠️ <b>Пишите вопросы когда:</b>

ℹ️ Вы уже пытались найти ответ внутри чата. 
Вопросы типа: "найдите за меня.." -- игнорируются

ℹ️ Вы <i>пытаетесь решить задачу самостоятельно</i>. 
Вопросы типа: "сделайте за меня", "сделайте мне", "дайте мне", "напишите мне" и т.д -- игнорируются

ℹ️ Вы прочитали всю информацию внутри бота и не нашли ответа.

----
🚫  искать исполнителей,
    что-то рекламировать,
    предлагать свои услуги в чате

🚫 политика | мат | оскорбления 

----
⚠️ <b>Бот для cбора документов: @docs_opeka_bot</b>;

ℹ️ О том, как пользоваться ботом, можно прочитать: <b><a href='https://telegra.ph/Kak-polzovatsya-botom-otdela-Opeki-07-18'>▶️Здесь</a></b>.

ℹ️ Любые благодарственные слова,  в ответ (свайп влево на телефоне) на сообщение участнику чата, повышают его карму.

👍 Не забывайте поблагодарить человека, который вам помог.💪

▶️ Команда: /top — выводит топ-лист самых помогающих.
▶️ Команда: /privacy — выводит информацию о том, какие данные используются.
----

<i>💬 "Навык поиска информации гораздо Важнее самой информации!"</i>

----

Чтобы писать в чат жми на кнопку👇`;

/*<b>bold</b>, <strong>bold</strong>
<i>italic</i>, <em>italic</em>
<u>underline</u>, <ins>underline</ins>
<s>strikethrough</s>, <strike>strikethrough</strike>, <del>strikethrough</del>
<span class="tg-spoiler">spoiler</span>, <tg-spoiler>spoiler</tg-spoiler>
<b>bold <i>italic bold <s>italic bold strikethrough <span class="tg-spoiler">italic bold strikethrough spoiler</span></s> <u>underline italic bold</u></i> bold</b>
<a href="http://www.example.com/">inline URL</a>
<a href="tg://user?id=123456789">inline mention of a user</a>
<code>inline fixed-width code</code>
<pre>pre-formatted fixed-width code block</pre>
<pre><code class="language-python">pre-formatted fixed-width code block written in the Python programming language</code></pre>*/