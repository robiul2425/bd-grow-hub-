const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('Bot is running!'));
app.listen(port, () => console.log(`Bot listening on port ${port}!`));

const { Telegraf, Markup } = require('telegraf');
const bot = new Telegraf(process.env.BOT_TOKEN);

const ADMIN_ID = '7508689903'; 

// --- ইউজার মেনু ---
bot.start((ctx) => {
    ctx.reply(`✨ ❖𝐁𝐃 𝐆𝐫𝐨𝐰 𝐇𝐮𝐛 ❖ ✨\n\nস্বাগতম! আপনার পয়েন্ট চেক করুন এবং প্রতিদিন ইনকাম করুন। 💎\n\n🚀 প্রিমিয়াম টাক্স A\n🚀 প্রিমিয়াম টাক্স B`,
        Markup.inlineKeyboard([
            [Markup.button.callback('🚀 প্রিমিয়াম টাক্স A', 'task_a'), Markup.button.callback('🚀 প্রিমিয়াম টাক্স B', 'task_b')],
            [Markup.button.callback('📺 অ্যাড দেখুন (১) 💎', 'watch_ad1'), Markup.button.callback('📺 অ্যাড দেখুন (২) 💎', 'watch_ad2')],
            [Markup.button.callback('💰 ব্যালেন্স ও উইথড্রো', 'withdraw_menu')]
        ])
    );
});

// --- উইথড্রো ও পেমেন্ট লজিক ---
bot.action('withdraw_menu', (ctx) => {
    ctx.editMessageText('⏳ লোডিং হচ্ছে... ✨✨✨\n\n💸 পেমেন্ট মেথড সিলেক্ট করুন:', Markup.inlineKeyboard([
        [Markup.button.callback('💠 বাইন্যান্স (০.১০)', 'pay_binance')],
        [Markup.button.callback('💠 বিকাশ (১০)', 'pay_bkash')],
        [Markup.button.callback('💠 নগদ (১০)', 'pay_nagad')],
        [Markup.button.callback('💠 রিচার্জ (২০)', 'pay_recharge')]
    ]));
});

// ইউজার পেমেন্ট রিকোয়েস্ট দিলে এডমিনের কাছে পাঠানো
bot.action(/pay_(.+)/, (ctx) => {
    const method = ctx.match[1];
    ctx.reply(`✅ আপনার রিকোয়েস্ট (${method}) সফলভাবে পাঠানো হয়েছে! ⏳`);
    
    bot.telegram.sendMessage(ADMIN_ID, `🔔 **নতুন উইথড্রো রিকোয়েস্ট!**\n\n👤 ইউজার: @${ctx.from.username || ctx.from.id}\n💳 মেথড: ${method}\n\nস্ট্যাটাস আপডেট করুন:`, 
    Markup.inlineKeyboard([
        [Markup.button.callback('✅ Success', `admin_success_${ctx.from.id}`)],
        [Markup.button.callback('⏳ Tentative', `admin_tentative_${ctx.from.id}`)],
        [Markup.button.callback('❌ Reject', `admin_reject_${ctx.from.id}`)],
        [Markup.button.callback('🚫 Ban', `admin_ban_${ctx.from.id}`)]
    ]));
});

// --- এডমিন প্যানেল লজিক ---
bot.action(/admin_(.+)_(.+)/, (ctx) => {
    if (ctx.from.id.toString() !== ADMIN_ID) return ctx.answerCbQuery('আপনি এডমিন নন!');
    
    const status = ctx.match[1];
    const userId = ctx.match[2];
    let icon = status === 'success' ? '✅' : status === 'tentative' ? '⏳' : status === 'reject' ? '❌' : '🚫';
    
    ctx.editMessageText(`${icon} স্ট্যাটাস আপডেট: ${status.toUpperCase()}\n👤 ইউজার ID: ${userId}`);
    
    bot.telegram.sendMessage(userId, `${icon} আপনার উইথড্রো রিকোয়েস্টটি ${status.toUpperCase()} হয়েছে!`);
});

bot.launch();
