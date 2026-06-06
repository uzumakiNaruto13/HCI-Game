label ending_barista:
    # this has a certain probability of being triggered when the player works as a barista
    $ has_triggered_ending_barista = True
    $ has_triggered_ending_today = True

    scene bg cafe with dissolve
    show man orange
    cafe_manager "Hey [player_name]. Can I have a word with you?"
    player surprised "!"
    player worry "(Did I do anything wrong? Served the wrong order and got some customer complaints maybe?)"
    player "(Am I gonna get fired? Why am I unable to hold even a simple barista gig?)"
    with hpunch
    player surprised "!"
    player "(The cafe manager has a big smile on his face.)"
    player relieved "(Calm down... Nothing bad is going to happen.)"
    player smile "Sure. Anything I can help with?"
    cafe_manager "What would you say to a promotion?"
    player surprised "A promotion?"
    cafe_manager "Yes. You've been working hard and performing really well."
    cafe_manager "Our customers love you and we would love to have a full-time barista like you."
    cafe_manager "Your new hourly rate will be twice what you have now. What do you say?"
    player neutral "(That sure sounds like good stuff, but working full-time would also mean that I'll have less time to study coding.)"
    player "(If my job gets too busy, I might need to give up on learning to code all together.)"
    player "(I feel like this is a really important decision for me to make. I need to think this through.)"

    call save_reminder from _call_save_reminder_15

    menu:
        player "(Should I take them up on the full-time barista offer?)"

        "Why not? I need cash and learning to code can wait.":
            pass

        "Nope. I really need to carve out more time to study and become a developer.":
            player "Thanks, but my plate's a bit too full at the moment for a full-time role."
            cafe_manager "No problem. We are happy enough to have you help out part-time."
            cafe_manager "Best of luck with whatever it is that you are doing. You'll do great."
            hide man
            return # return control to the script that called this label

    player happy "I'd love to work full-time here."
    cafe_manager "Great! I was hoping that this would be an offer that you can't turn down."
    cafe_manager "Okay, starting tomorrow, I'm hoping to see you here from nine to five."
    player "Sure thing! Being punctual was one of my biggest strengths during college."
    cafe_manager "That's great news to our customers. Keep up the great work."
    hide man
    player smile "Okay, I guess I have a full-time job now."
    player "Once I have enough cash, I can always quit and learn to code full-time, right?"

    $ calendar_enabled = False
    $ player_base = 'player_apron' # no need to reset this b/c we are using default

    call screen text_over_black_bg_screen("A year later...")
    scene bg cafe with fade
    player neutral "So I've been working full-time as a barista for a whole year now."
    player "The work keeps me quite busy every day, and I don't have much time left by the end of the day to learn to code."
    player smile "But coming in every day, greeting people on their way to work, seeing them leave the cafe with a smile on their face - those are really precious moments."
    player "Plus I still get to hear about cool things happening in tech every now and then."
    show woman purple
    female "Hey [player_name]. How was your day?"
    player surprised "(My customers even know me by name now...)"
    player smile "My day's been great! What about yours?"
    female "Good. I just heard about this new app that's trending in the developer community..."

    scene bg cafe dusk with fade
    player happy "(Well, I'm happy with where I am now, I think.)"

    call screen text_over_black_bg_screen("Two years later...")
    scene bg cafe with fade
    player neutral "Same old day. I've been working full-time here at this cafe for two years now."
    player smile "Well, there is one thing that's different: I got promoted to the cafe manager."
    player "Turns out that the cafe is doing so well that it needs to open up new chain stores, so the old cafe manager who offered me this full-time barista position switched stores."
    player "Now that I'm managing this cafe, I have even more responsibilities."
    player worry "I feel like I won't be getting back to learning to code any time soon."
    player neutral "但这本身不是坏事……{p=1.0}{nw}"
    show girl blue with moveinleft
    player happy "Hello! What can I get for you?"
    player "..."
    player "(It looks like she is talking on the phone.)"
    girl "I'm at the cafe now."
    girl "What? You won't be here for an hour because you're stuck in traffic?"
    girl "But we need to figure out this bug as soon as possible so we can unblock the team who depends on our API!"
    girl "Grrrrgggghhhhh..."
    player surprised "(It looks like they are stuck on some coding project.)"
    player "(Maybe I can help?)"
    player happy "Hey, excuse me. I'm [player_name]. I work at this cafe."
    player "Sorry that I overheard your conversation, but if it's something related to coding, maybe I can help."
    player "I might not look like much but I used to be an aspiring developer!"
    player pout "(Well, not anymore...)"
    girl "Wow that'd be awesome! Thanks!"
    player laugh "Alright, here goes. Let's take a look..."

    play sound 'audio/sfx/alternative_ending.wav'
    call screen text_over_black_bg_screen("{i}Ending: [ending_barista]{/i}")

    scene bg cafe
    $ add_achievement(
        achievement_name=ending_barista,
        message=alternative_endind_message
        )

    jump second_chance
    scene bg cafe with dissolve

    return # return control to the label it jumped from

label ending_cat:
    # this has a certain probability of being triggered during the night
    $ has_triggered_ending_cat = True
    $ has_triggered_ending_today = True

    scene black
    scene bg bedroom with eyeopen
    play sound 'audio/sfx/keyboard_typing.wav'
    player relieved "Yawwwn...."
    player worry "I heard some strange noises coming from under my bed. Maybe Mint is hungry and woke up?"
    player surprised "Mint? Is that you?"
    player neutral "..."
    player worry "Mint didn't show up. Should I check what's happening?"
    menu:
        player "Should I check what's happening?"

        "Check under the bed.":
            pass # continue with the plot

        "Just go back to sleep.":
            player "Nah. Mint's a good cat and won't do any damage."
            player relieved "I could use more sleep so that I'll wake up energized for a new day."
            return # return control to the script that called this label

    # if player decides to check
    play sound 'audio/sfx/keyboard_typing.wav' volume 1.2
    scene bg laptop_screen night with dissolve    
    show mint_with_pixel_sunglasses with moveinbottom
    player surprised "Mint? What are you doing under my bed with my laptop?"
    with hpunch
    player "And what's with those sunglasses?"
    with vpunch
    player neutral "(Okay. Calm down. Deep breath. Let's find out what Mint is doing)"
    player "(Mint looks absorbed while ardently typing on my laptop.)"
    player "(It looks like Mint has a text editor open. For what? Writing code?)"
    player surprised "(Hang on. Mint is pulling up a terminal now. Maybe the code is done and ready to deploy?)"
    player pout "(Geez... I don't even know if I'm more curious about what Mint has coded up or how a cat is able to do any of these things in the first place.)"
    player surprised "(Oh! The website is coming up live!)"
    player "(Wait. I think I know this interface...)"
    player "(Isn't that just [developerquiz]?!)"
    player "(Wait wait wait. So Mint was the one who coded up [developerquiz], the go-to website for aspiring developers?)"
    player pout "(My logic is failing me at this point...)"
    player relieved "(也许这全是梦？)"
    menu:
        player "也许这全是梦？"

        "I must be dreaming. Let's go back to sleep.":
            player worry "I must be so exhausted and anxious about the coding stuff that I'm hallucinating about Mint writing code."
            player relieved "在{b}精力{/b}耗尽前再睡会吧。"
            hide mint_with_pixel_sunglasses
            return # return control to the script that called this label

        "This can't be a dream. I need to figure out what's going on.":
            pass

    player neutral "不这不是梦得搞清楚。"
    player "What I've gathered from what I've seen is that Mint is a coding whiz..."
    player laugh "And isn't that awesome? I mean, I have a {bt}pretty code-y cat myself{/bt}!"
    player smile "嘿Mint！有空吗？"
    player neutral "..."
    player "(Mint is still staring determinedly at the laptop and not responding to me.)"
    player smile "Oh, well, I guess this could be Mint's way of telling me to keep this secret?"
    player "(I better choose my action carefully so as not to upset Mint.)"

    call save_reminder from _call_save_reminder_16

    menu:
        player "Shall I keep this as a secret just between Mint and me?"
    
        "Let's keep this a secret and say goodnight to Mint.":
            player "好Mint你很棒继续做你的事。"
            player "有一天我会赶上你。"
            player laugh "Good night!"
            hide mint_with_pixel_sunglasses
            return
    
        "But it's such a loss for the world if people don't know about Mint!":
            pass

    player happy "(It's a waste if Mint's talent goes unnoticed. Together we can make history!)"
    player "嘿Mint！介意我加入跟你学编程吗？"

    $ player_glasses = 'player_pixelsunglasses'

    player "来我也弄了同款墨镜。"
    player laugh "戴着怎么样？"
    mint "Meow! (Looks great!)"
    player "喜欢吗？谢谢Mint！"
    mint "Meow! (Now let's get to work!)"
    player "你让我现在开始工作？好我尽力！"
    $ calendar_enabled = False

    call screen text_over_black_bg_screen("A month later...")
    scene bg hall with fade
    host "And now let's give a round of applause to the winning team: {b}The Code-y Cats{/b}!"
    play sound 'audio/sfx/applause.ogg'
    show mint_with_pixel_sunglasses
    player laugh "哇……多亏Mint我们得了第一名太棒了！"
    host "We hope to see you at our next hackathon as well!"

    call screen text_over_black_bg_screen("A year later...")
    scene bg hall_audience with fade
    play sound 'audio/sfx/applause.ogg'
    show woman orange
    journalist "Did you see that person and the cat there? They are the famous {b}The Code-y Cats{/b}!"
    show girl flipped red at left with moveinleft
    college_girl "这就是在各种黑客马拉松拿奖的团队？"
    show boy red at right with moveinright
    boy "That's impressive!"
    journalist "Rumor even has it that the cat is a coding whiz."
    college_girl "真神秘……"

    hide woman
    hide girl
    hide boy
    show mint_with_pixel_sunglasses with moveinbottom
    mint "Meow! (保密好吗？)"
    window hide
    hide mint_with_pixel_sunglasses
    with pixellate

    play sound 'audio/sfx/alternative_ending.wav'
    call screen text_over_black_bg_screen("{i}Ending: [ending_cat]{/i}")

    $ add_achievement(
        achievement_name=ending_cat,
        message=alternative_endind_message
        )
    jump second_chance
    scene bg bedroom with dissolve
    
    return

label ending_tutor:
    # this has a certain prob of being triggered during dinner
    $ has_triggered_ending_tutor = True
    $ has_triggered_ending_today = True

    scene bg kitchen night with dissolve
    mom "刚想起要告诉你[player_name]。"
    mom "有兴趣教孩子编程吗？"
    mom "A high school affiliated with the one where I'm teaching is looking to expand their CS curriculum."
    mom "在找辅导老师。 It's a temporary position for now, but may eventually turn into a full-time teaching contract."
    player surprised "That sounds cool..."
    mom "我知道你在自学编程可能占用时间。"
    mom "由你决定不给你压力。"
    player smile "(Mom's as considerate and resourceful as always.)"

    menu:
        player "(Should I take up the CS tutor gig?)"
    
        "Why not? Teaching is the best way to learn!":    
            pass
    
        "Nah. I'm too busy teaching myself already.":
            player neutral "谢谢妈妈我自学太忙了这次算了。"
            mom "别担心亲爱的需要什么告诉我。"
            return

    player happy "谢谢妈妈听起来有趣很乐意试试。"
    mom "好明天跟我去学校吧？"
    player "Will do!"

    $ calendar.next()
    scene bg classroom with fade
    show boy purple with moveinleft
    boy "大家安静回座位！"
    boy "听说要来新辅导老师教编程。"
    hide boy with moveoutright
    player happy "Hi everyone. I'm [player_name]. I'm your CS tutor for the day."
    player smile "直接开始！谁能告诉我什么是计算机程序？"
    girl "我知道！像手机上的应用！"
    boy "还有电子游戏！"
    girl "Eh. The video game talk again. Can you talk for one second about something else?"
    player surprised "(Wow. The kids sure are energetic. And smart, too!)"
    player "好都是好答案现在让我给出定义……"

    scene bg classroom dusk with fadehold
    boy "今天太感谢了！很有趣！"
    girl "学到很多！希望再见！"

    scene bg kitchen dusk with fadehold
    mom "喜欢教学吗[player_name]？"
    mom "I heard that the kids loved you and the school would like you to come every day if that works for your schedule."
    player neutral "（很有趣但也很辛苦。）"
    player "(But if I need to come in every day, I won't have time to learn to code and become a developer myself.)"
    player "(That said, am I that hellbent on becoming a developer? Wouldn't it be fun to pass along my coding knowledge?)"
    player "（坚持学编程还是继续教编程？）"
    player "(I feel like this is a really important decision for me to make. I need to think this through.)"

    call save_reminder from _call_save_reminder_17

    menu:
        player "(Should I stick to learning to code, or continue to teach coding?)"
    
        "Let's stick to learning to code and become a developer.":
            player "(Right. I shouldn't forget about my initial goal.)"
            player "(要成为优秀开发者需要努力。)"
            mom "亲爱的很安静不用急着决定。"
            player smile "谢谢妈妈已经决定了。"
            player "坚持原计划学编程找超棒的开发者工作。"
            mom "怎样都为你高兴亲爱的今晚好好休息。"
            return

        "Let's teach coding and pass along the torch.":
            pass

    $ calendar_enabled = False
    call screen text_over_black_bg_screen("A month later...")
    scene bg classroom with fade
    player happy "这就是for循环的原理都清楚了吗？"
    boy "This for loop thing is amazing! {b}For{/b} each enemy in the game, I'm gonna beat 'em up!"
    girl "... {b}For{/b} each time you mention video games, I'm gonna tell you to cut it out."
    player laugh "我们{b}跳出{/b}for循环继续好吗？"

    call screen text_over_black_bg_screen("A year later...")
    scene bg classroom with fade
    # actually meets Layla who volunteers here
    player smile "听说今天有特别嘉宾。"
    player "她是热爱教学和志愿服务的开发者。"
    player "她会给班级讲软件工程工作是什么样的。"
    player "（哦她来了！）"
    show layla
    player surprised "（等等看起来很眼熟。）"
    player "(...Oh! Was that her at Hacker Space mentoring the kids?)"
    player "(If I remember correctly...)"

    scene bg hacker_space with fadehold
    show layla
    layla @ laugh "So how's everyone's project going? We mentors are here to answer any questions you have!"

    scene bg classroom with fade
    show layla
    player "（绝对是在黑客空间见过的她！）"
    layla "嘿！我是Layla。"
    player smile "嗨Layla很高兴认识你！我是[player_name]在这教了一年。"
    layla "太棒了！教学是我最喜欢做的事。"
    layla "好寒暄够了该跟班级讲话了吧？"
    player happy "Yeah sure!"
    player laugh "Hey class, today we have Layla, a full-time developer, here to talk to you about what it's like to work in tech."
    layla @ laugh "谢谢介绍[player_name]我是Layla。"
    layla "开始讲之前先告诉你们。"
    layla "I once had to make a very difficult choice between working in software or teaching coding at a school."
    player pout "(That sounds familiar. I've been there before, too.)"
    layla "选了前者所以在这里。"
    layla @ laugh "不过有时确实想知道选了不同会怎样。"
    player relieved "(Layla looks content with where she is now. Hmmm... but I do wonder, what could've happened if I'd chosen differently?)"

    play sound 'audio/sfx/alternative_ending.wav'
    call screen text_over_black_bg_screen("{i}Ending: [ending_tutor]{/i}")

    scene bg classroom
    $ add_achievement(
        achievement_name=ending_tutor,
        message=alternative_endind_message
        )
    jump second_chance
    scene bg kitchen night with dissolve
    
    return

label ending_office:
    # this has a certain prob of being tiggered during the evening once the player starts doing coding interviews
    $ has_triggered_ending_office = True
    $ has_triggered_ending_today = True

    scene bg bedroom with dissolve
    play sound 'audio/sfx/social_media_notification.wav'
    show smartphone at truecenter
    player surprised "嗯……手机通知？"
    player neutral "写着我们在招聘！也许是大学毕业时申请的旧办公室工作。"
    player "要读邮件吗？"
    menu:
        player "Should I read the email about an office job application?"
    
        "Won't hurt if I read it.":
            pass
    
        "No. Office jobs are a bore.":
            player "不谢谢我绝对不会一辈子做无聊办公室工作。"
            player "Message deleted. Now I'm gonna get back to my day."
            hide smartphone
            return

    hide smartphone

    player "Won't hurt if I read the email."
    player "Hmm... They said they looked at my application and thought I'm a good fit. Well, it's easy office work, so anyone is a good fit."
    player "技术最复杂的事大概就是电子表格。"
    player "但工资还算不错……"
    player "也许做几个月看看？"
    player "(I feel like this is a really important decision for me to make. I need to think this through.)"

    call save_reminder from _call_save_reminder_18

    menu:
        "Should I accept the office job?"
    
        "It pays okay so why not?":
            pass
    
        "Nah. I want to become a developer, not an office worker.":
            player "Right. I shouldn't forget about my initial goal."
            player "要成为优秀开发者需要努力。"
            player "Message deleted. Now I'm gonna get back to my day."
            return

    $ calendar_enabled = False
    call screen text_over_black_bg_screen("A week later...")
    scene bg cubicle with fade
    player neutral "（好在新办公室工作。）"
    office_worker "Hey you there. Come with me to fix the fax machine now."
    player surprised "Uhhh okay!"
    player worry "（跟想象一样无聊。）"
    player "(But I guess beggars can't be choosers...)"

    call screen text_over_black_bg_screen("A year later...")
    scene bg cubicle with fade
    player neutral "(It's been a year, and here I am, still at my office job.)"
    player "(The work is boring and mentally draining, so I come home everyday too exhausted to do anything else.)"
    player @ pout "(Geez, I haven't even had the energy to play video games in a long time, let alone learn to code in my spare time.)"
    office_worker "Hey you. Stop daydreaming. The boss wants this presentation slide deck done today."
    player "Oh, sorry, I'll get it done as soon as possible."

    call screen text_over_black_bg_screen("Two years later...")
    scene bg cubicle with fade
    player neutral "(It's been what, two years already?)"
    player "(Here I am. Still working this office job.)"
    player "(At this point, it's not like I have an opinion anymore about staying here or quitting.)"
    player pout "(I mean, making spreadsheets and slides is the only skill I have.)"
    player worry "(Ugh. And making coffee as well.)"
    player relieved "(Guess this is it? Unless...)"

    play sound 'audio/sfx/alternative_ending.wav'
    call screen text_over_black_bg_screen("{i}Ending: [ending_office]{/i}")

    scene bg cubicle
    $ add_achievement(
        achievement_name=ending_office,
        message=alternative_endind_message
        )
    jump second_chance
    scene bg bedroom with dissolve
    
    return

label ending_farmer:
    # this is triggered if energy is too low
    $ has_triggered_ending_farmer = True
    $ has_triggered_ending_today = True

    scene bg bedroom with dissolve
    player relieved "太太太累了……"
    player pout "需要休息长长的。"
    player "Just last night, I read about the guy who quit software engineering because he was burnt out."
    player "他去做了农民。 Told the journalist a year later that he had no intention of returning to tech."
    player neutral "也许农业也是我的使命？"
    player "但选了农业大概回不去了。 I better think this though..."

    call save_reminder from _call_save_reminder_19

    menu:
        player "真要放弃学编程拥抱大自然吗？"
    
        "Sounds like a plan!":
            pass
    
        "Just kidding!":
            player relieved "Ughhhh... I'm kidding, I hope."
            show mint
            mint "Meow!"
            player smile "哦Mint你是想告诉我不要放弃吗？"
            player "Awww thanks Mint. I won't give up if you don't give up on me."
            hide mint
            player neutral "好不错的玩笑但不切实际。"
            player "Let's just go take a walk in the park to celebrate mother nature."
            call day_activity_park from _call_day_activity_park_2
            $ player_stats.change_stats_random(ENERGY, 5, 20)
            return

    $ calendar_enabled = False
    $ player_base = 'player_overall'
    $ player_glasses = None

    scene bg farm with fade
    player happy "Wow! This farm is huge! Bigger than what I've seen in the movies!"
    player "Guess this is where I'll be calling home now."
    player pout "Too bad Mint couldn't come with me here. I guess I will miss home a lot."
    player smile "I can always go back to visit. Meanwhile, let's take some photos and send them home while I'm here!"

    call screen text_over_black_bg_screen("A year later...")
    scene bg farm with fade
    player happy "Well, I've been on this farm for a year now."
    player "一天从挤牛奶收鸡蛋开始。"
    player "然后照料蔬菜。"
    player "不知不觉就到黄昏。"

    play sound 'audio/sfx/cricket.ogg'
    scene bg farm dusk with fade
    player laugh "It's so pretty out here on the farm at dusk. The clouds turn a thousand nice warm shades."
    scene bg farm night with fade
    player "Sometimes we have a campfire and s'mores at night."
    player happy "I'm enjoying this farm life so much that I don't think I will return to the city any time soon..."

    play sound 'audio/sfx/alternative_ending.wav'
    call screen text_over_black_bg_screen("{i}Ending: [ending_farmer]{/i}")

    $ add_achievement(
        achievement_name=ending_farmer,
        message=alternative_endind_message
        )
    jump second_chance
    scene bg bedroom with dissolve

    return

label second_chance:
    # stop the regular bgm
    stop music fadeout 1.0

    # this label must be used with jump, not call
    scene bg chaos with dissolve
    # Note to proofreader: this is an omnipotent narrator, so feel free to change their tone
    "Hey [player_name]. Kudos to you for coming this far in the game."
    "That wasn't a bad way to end the story. Not bad at all."
    "But if you think about it, would you have wanted something different?"
    "Would it be possible to teach yourself to code and fulfill your dream of becoming a developer?"
    "Do you wish for an ending like that?"
    "Okay, I'm going to let you in on a little secret."
    "If you like, you can wind back the clock and revisit the choices you've made."
    "If I may ask, did you remember to {b}Save{/b} your progress before making this choice that has taken you here?"
    call screen confirm(_("Did you SAVE your progress and wish to LOAD and get back in time? (It's okay if you answer no. I'll let you in on another secret.)"), 
        yes_action=[ShowMenu('load'), Return()], 
        no_action=Return())

    # if the player didn't load, they get down here
    "Interesting. It looks I have no choice but to let you in on my other little secret."
    "Listen up, alright? I can offer you a second chance to go back to the day you made the choice that took you here."
    "That is, if you so wish."
    "Now answer me this, would you like to get a second chance?"
    menu:
        "Would you like to go back in time and revisit your choice?"
    
        "Time traveling! Let's do it.":
            "You know the rocket ship saying? 'If you're offered a seat on a rocket ship, don't ask what seat.'"
            "Let's rollback in time, brave traveler."
            scene bg tunnel with fadehold

            play sound 'audio/sfx/rewind.wav' # 5 sec
            pause 4.0

            if not plot_rewind_time in persistent.achievements:
                $ add_achievement(plot_rewind_time)

            $ player_base = 'player_base'
            $ player_glasses = 'player_glasses'
            $ calendar_enabled = True
            # resume the bgm
            # $ continue_looping_music = True
            $ random.shuffle(all_music_files)
            $ renpy.music.queue(all_music_files, loop=True, fadein=1.0, tight=True)

            return # return control to the ending label that it jumped from
    
        "Nah. I'm happy with what I have now.":
            "Well, the Buddha said 'There is no path to happiness; happiness is the path.'"
            "I'm glad that you are happy with where you are."
            "I hope this has been a pleasant ride for you, brave traveler."
            "Until next time!"
            stop music
            jump ending_splash

    return

label ending_splash: # alternative endings also jump to here
    $ quick_menu = False
    $ calendar_enabled = False
    # Learn to Code RPG logo
    scene gray90 with Pause(1)
    play sound 'audio/sfx/title_fire_swoosh.ogg'
    show learn_to_code_rpg_logo at truecenter with dissolve
    with Pause(2)
    scene gray90 with dissolve
    with Pause(1)

    # freeCodeCamp logo
    scene gray90 with Pause(1)
    play sound 'audio/sfx/title_fire_swoosh.ogg'
    show fcc_logo at truecenter with dissolve
    with Pause(2)
    scene gray90 with dissolve
    with Pause(1)

    # Credits, like in the About section from options.rpy
    # use a lighter background because the hyperlinks are dark blue
    scene main_menu overlay with dissolve
    pause 1
    show text _("{size=48}Thanks for playing {b}Learn to Code RPG{/b}!\n\n[about!t]{/size}")
    with dissolve 
    show screen ctc() # click to continue
    pause
    hide text with dissolve

    show text "{size=48}[credits!t]{/size}"
    with dissolve 
    pause
    hide screen ctc
    hide text with dissolve

    $ quick_menu = True
    scene main_menu sepia with dissolve

    "Hey [player_name]. Congratulations on reaching the end of the game!"
    "Hope you enjoyed the ride!"
    "You might be wondering, what's next?"
    "Well, here are a bunch of things you can do."

    default post_game_choices = set()
    menu post_game_choice:
        set post_game_choices
        "Here are some fun things that you can do now that you've finished the game. Select an option to learn more."

        "Check out your achievements and tweet {icon=icon-twitter}":
            "Let's get social! You've made a lot of progress throughout the game and it's time to spread the words."
            "You can view your achievements on the {b}Bonus > Achievements{/b} screen. Click on the {b}Tweet{/b} button next to the achievement to tweet it."
            "If you see a lock next to the achievement, backtrack to some point in the game, try different choices, and see if you can unlock it."
            call screen achievements_screen()
            "Will you be able to unlock all of the achievements? Now that's a dare."
            jump post_game_choice

        "Rate and review this game on itch.io {icon=icon-thumbs-up}":
            "Help us improve the game by rating and reviewing [learn_to_code_rpg_on_itch]."
            show itch_rate at truecenter with zoomin
            "You can find the {b}Rate Game{/b} button in the top right corner of the itch.io game page."
            "Refer to {a=https://itch.io/updates/you-can-now-rate-games}this itch.io article{/a} for more details."
            hide itch_rate
            menu:
                "Would you mind taking a minute to rate and review us?"
                "Sure thing! Take me to the page.":
                    "Thanks! Here's the link to [learn_to_code_rpg_on_itch]."
                "I've done that already!" if not persistent.has_rated_and_reviewed_on_itch:
                    "Awesome. Thank you for your input!"
                    $ persistent.has_rated_and_reviewed_on_itch = True
                "Maybe next time :)":
                    "Of course! Take your time to explore and enjoy the game. You can visit this link anytime from the {b}Bonus{/b} screen."
            jump post_game_choice

        "Star the game's source code on GitHub {icon=icon-star}":
            "Interested in learning about how this game is built? Take a peek into our source code by visiting [learn_to_code_rpg_on_github]."
            show github_star at truecenter with zoomin
            "Better yet, {b}Star{/b} our repository for your reference and {b}Watch{/b} for updates!"
            "Refer to {a=https://docs.github.com/en/get-started/exploring-projects-on-github/saving-repositories-with-stars}this GitHub article{/a} for more details."
            hide github_star
            menu:
                "Would you like to check out our GitHub repository?"
                "Sure thing! Take me to the page.":
                    "Thanks! Here's the link to [learn_to_code_rpg_on_github]."
                "I've done that already!" if not persistent.has_visited_github:
                    "Awesome. Enjoy digging through the source code!"
                    $ persistent.has_visited_github = True
                "Maybe next time :)":
                    "Of course! Take your time to explore and enjoy the game. You can visit this link anytime from the {b}Bonus{/b} screen."
            jump post_game_choice

        # "Support this game and other freeCodeCamp.org projects by donating {icon=icon-heart}":
        #     "This game was made possible by all the kind people who donate to support [freeCodeCamp]."
        #     "You can help support our nonprofit's mission {a=https://www.freecodecamp.org/news/how-to-donate-to-free-code-camp/}by donating to us here{/a}."
        #     "Remember you can visit link anytime from the {b}Bonus{/b} screen."
        #     jump post_game_choice
        
        # "Check out the bonus screen for minigames, resources, and more {icon=icon-award}":
        #     "Did you have the chance to enjoy the rhythm minigame while you were busy learning to code, visiting the Hacker Space, and serving coffee?"
        #     "Are you interested in checking out the actual [freeCodeCamp] curriculum and teach yourself to code in real life?"
        #     "Well, you are in luck. The {b}Bonus{/b} screen has everything that you'll possibly need."
        #     # go to the bonus screen
        #     call screen bonus_screen()
        #     "I'm sure you will make good use of the bonus content!"
        #     jump post_game_choice

        "Discover alternative endings {icon=icon-map}":
            "Which ending took you here, if I may ask?"
            "Did you become a developer like you've always dreamed to be? Or did you take up some other job?"
            "Perhaps you discovered that Mint, your adorable home cat, is better at coding than you?"
            "Psssst... Did I just spoil the fact that there are several alternative endings hidden in the game?"
            "The endings you unlocked will be displayed on the {b}Bonus > Achievements{/b} screen."
            "Make sure to {b}Save{/b} your progress often if you want to unlock all of them!"
            jump post_game_choice

        "Gotcha. I'm ready to explore on my own!":
            "Great to hear! Hope you enjoyed the ride!"
            
    return # return to main menu
