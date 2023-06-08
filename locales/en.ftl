start_command = 
    .description = Start the bot
language_command = 
    .description = Change language
admin_command =
    .description = Make user an administrator
stats_command =
    .description = Stats
setcommands_command =
    .description = Set bot commands

language = 
    .select = Please, select your language
    .changed = Language successfully changed!
admin =
    .user-not-found = User not found

    .select-user = Please, select a user to change role
    .select-user-btn = Select user
    .your-role-changed = You're {$role ->
        *[USER] a regular user
        [ADMIN] an administrator
    } now.
    .user-role-changed = User with ID {$id} is now {$role ->
        *[USER] a regular user
        [ADMIN] an administrator
    }.
    
    .commands-updated = Commands updated.

verify-chat = 
    .progress = Broadcasting to {$totalCount}
    
    {$pb}
    {$errors}
    
    {$emojis}

list =
    .empty = you have no channels in the list :(

chat-member = 
    .bot-can-post = اصبح البوت ادمن في القناة هل تود اضافتها في اللستة؟

    اسم القناة: {$name}
    رابط القناة: {$link}
    معرف القناة: @{$username}

    .bot-can-not-post = تم حذف البوت من ادارة القناة وتم حذف القناة من اللستة

    اسم القناة: {$name}
    رابط القناة: {$link}
    معرف القناة: {$username}