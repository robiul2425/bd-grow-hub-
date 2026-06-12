const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');

const token = '8673752168:AAGOvv_T215CJne4BeXHOFALBxrpsUDjhX0';
const ADMIN_ID = '7508689903';
const MONGODB_URI = 'mongodb+srv://my_app_user:F21WquPY11buMtA0@cluster0.kojbh8z.mongodb.net/?appName=Cluster0';

const bot = new TelegramBot(token, { polling: true });

mongoose.connect(MONGODB_URI)
  .then(() => console.log("✅ ডাটাবেস সচল!"));

const userSchema = new mongoose.Schema({
    userId: String,
    balance: { type: Number, default: 0 },
    status: { type: String, default: 'active' },
    history: Array
});
const User = mongoose.model('User', userSchema);

// মেইন মেনু
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "❖𝐁𝐃 𝐆𝐫𝐨𝐰 𝐇𝐮𝐛 ❖ এ স্বাগতম!\nআপনার উইথড্র অপশন নিচে দেওয়া হলো:", {
        reply_markup: {
            inline_keyboard: [
                [{ text: "💰 উইথড্র করুন", callback_data: "withdraw_menu" }]
            ]
        }
    });
});

// উইথড্র মেনু ও পেমেন্ট লজিক
bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    if (query.data === 'withdraw_menu') {
        bot.sendMessage(chatId, "আপনার পেমেন্ট মেথড নির্বাচন করুন:", {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "🟢 বাইনান্স (০.১০)", callback_data: "pay_binance" }],
                    [{ text: "🟢 বিকাশ (১০)", callback_data: "pay_bkash" }],
                    [{ text: "🟢 নগদ (১০)", callback_data: "pay_nagad" }],
                    [{ text: "🟢 রিচার্জ (২০)", callback_data: "pay_recharge" }]
                ]
            }
        });
    }

    // পেমেন্ট রিকোয়েস্ট
    if (query.data.startsWith('pay_')) {
        const method = query.data.split('_')[1];
        await bot.sendMessage(chatId, `🟠 আপনার ${method} রিকোয়েস্টটি Tentative Approval এর জন্য জমা হয়েছে।`);
        
        bot.sendMessage(ADMIN_ID, `নতুন রিকোয়েস্ট:\nইউজার: ${chatId}\nমেথড: ${method}\nস্ট্যাটাস: 🟠 Tentative`, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "✅ Success", callback_data: `admin_success_${chatId}` },
                     { text: "❌ Reject", callback_data: `admin_reject_${chatId}` },
                     { text: "🚫 Ban", callback_data: `admin_ban_${chatId}` }]
                ]
            }
        });
    }
    
    // অ্যাডমিন অ্যাকশন
    if (query.data.startsWith('admin_')) {
        const [_, action, uid] = query.data.split('_');
        let msgToUser = "";
        if (action === 'success') msgToUser = "🟢 অভিনন্দন! আপনার পেমেন্ট সাকসেসফুল হয়েছে।";
        if (action === 'reject') msgToUser = "🔴 দুঃখিত! আপনার পেমেন্ট রিজেক্ট করা হয়েছে।";
        if (action === 'ban') msgToUser = "🚫 আপনার একাউন্টটি ব্যান করা হয়েছে।";
        
        bot.sendMessage(uid, msgToUser);
        bot.sendMessage(ADMIN_ID, `অ্যাডমিন আপডেট: ${action} সম্পন্ন হয়েছে।`);
    }
});
