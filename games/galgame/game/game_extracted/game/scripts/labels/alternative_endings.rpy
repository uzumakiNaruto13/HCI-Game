label ending_barista:
    # this has a certain probability of being triggered when the player works as a barista
    $ has_triggered_ending_barista = True
    $ has_triggered_ending_today = True

    scene bg cafe with dissolve
    show man orange
    cafe_manager "Hey [player_name]. Can I have a word with you?"
    player surprised "!"
    player worry "（我做错什么了吗？上错了单收到顾客投诉了？）"
    player "（会被炒吗？为什么连简单的咖啡师工作都保不住？）"
    with hpunch
    player surprised "!"
    player "（咖啡店经理脸上挂着灿烂的笑容。）"
    player relieved "（冷静……不会有坏事发生。）"
    player smile "Sure. Anything I can help with?"
    cafe_manager "What would you say to a promotion?"
    player surprised "升职？"
    cafe_manager "是的。你一直工作很努力，表现非常出色。"
    cafe_manager "我们的顾客很喜欢你，我们很乐意有一个像你这样的全职咖啡师。"
    cafe_manager "你的新时薪将是现在的两倍。你觉得怎么样？"
    player neutral "（听起来不错但全职意味着学编程时间变少。）"
    player "（如果工作太忙可能得完全放弃编程。）"
    player "（这是很重要决定需要好好考虑。）"

    call save_reminder from _call_save_reminder_15

    menu:
        player "（要接受全职咖啡师offer吗？）"

        "为什么不？需要钱学编程可以等等。":
            pass

        "不我需要更多时间学习成为开发者。":
            player "谢谢但现在日程太满了做不了全职。"
            cafe_manager "没问题很高兴你能兼职帮忙。"
            cafe_manager "祝一切顺利你会很棒的。"
            hide man
            return # return control to the script that called this label

    player happy "很乐意在这里全职工作。"
    cafe_manager "太好了！希望这是你没法拒绝的offer。"
    cafe_manager "好从明天开始朝九晚五在这里见到你。"
    player "没问题！守时是大学最大优点。"
    cafe_manager "对顾客是好消息继续保持。"
    hide man
    player smile "好现在有全职工作了。"
    player "存够钱随时辞职全职学编程对吧？"

    $ calendar_enabled = False
    $ player_base = 'player_apron' # no need to reset this b/c we are using default

    call screen text_over_black_bg_screen("一年后……")
    scene bg cafe with fade
    player neutral "做全职咖啡师整整一年了。"
    player "每天都很忙一天结束没时间学编程。"
    player smile "但每天来上班跟人们打招呼看他们笑着离开——这些都是珍贵时刻。"
    player "而且还能时不时听到科技界的酷事。"
    show woman purple
    female "嘿[player_name]今天过得怎样？"
    player surprised "（顾客现在都知道我名字了……）"
    player smile "今天很好！你呢？"
    female "不错刚听说开发者社区有个新应用很火……"

    scene bg cafe dusk with fade
    player happy "（嗯对现在状态挺满意。）"

    call screen text_over_black_bg_screen("两年后……")
    scene bg cafe with fade
    player neutral "和往常一样在这全职工作两年了。"
    player smile "不过有一件事不同了：升职成咖啡馆经理。"
    player "咖啡馆生意太好要开新连锁店之前给我全职offer的老经理换店了。"
    player "管理咖啡馆责任更大了。"
    player worry "感觉短期内回不去学编程了。"
    player neutral "但这本身不是坏事……{p=1.0}{nw}"
    show girl blue with moveinleft
    player happy "你好！要点什么？"
    player "……"
    player "（看起来她在打电话。）"
    girl "我在咖啡馆了。"
    girl "什么？堵车要一小时才能到？"
    girl "但我们需要尽快解决bug才能让依赖API的团队继续！"
    girl "呃呃呃呃……"
    player surprised "（看起来他们卡在编程项目上了。）"
    player "（也许我能帮忙？）"
    player happy "嘿打扰一下我是[player_name]在这家咖啡馆工作。"
    player "抱歉听到你们谈话如果是编程相关也许我能帮忙。"
    player "可能看不出来但我曾经渴望成为开发者！"
    player pout "（嗯不再是了……）"
    girl "哇太棒了！谢谢！"
    player laugh "好来吧看看……"

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
    player worry "听到床下有奇怪声音，也许Mint饿了醒了？"
    player surprised "Mint？是你吗？"
    player neutral "……"
    player worry "Mint没出来，要看看怎么回事吗？"
    menu:
        player "要看看怎么回事吗？"

        "看看床底下。":
            pass # continue with the plot

        "继续睡觉吧。":
            player "算了Mint是好猫不会搞破坏。"
            player relieved "多睡会明天精力充沛。"
            return # return control to the script that called this label

    # if player decides to check
    play sound 'audio/sfx/keyboard_typing.wav' volume 1.2
    scene bg laptop_screen night with dissolve    
    show mint_with_pixel_sunglasses with moveinbottom
    player surprised "Mint？你在我床下用我笔记本做什么？"
    with hpunch
    player "还有那墨镜怎么回事？"
    with vpunch
    player neutral "（好冷静深呼吸看看Mint在做什么）"
    player "（Mint看起来专注地在笔记本上打字。）"
    player "（Mint打开了文本编辑器。做什么？写代码？）"
    player surprised "（等等，Mint在打开终端。代码写好了准备部署？）"
    player pout "(Geez... I don't even know if I'm more curious about what Mint has coded up or how a cat is able to do any of these things in the first place.)"
    player surprised "(Oh! The website is coming up live!)"
    player "(Wait. I think I know this interface...)"
    player "（这不就是[developerquiz]吗？！）"
    player "(Wait wait wait. So Mint was the one who coded up [developerquiz], the go-to website for aspiring developers?)"
    player pout "(My logic is failing me at this point...)"
    player relieved "(也许这全是梦？)"
    menu:
        player "也许这全是梦？"

        "我一定是在做梦。回去睡觉吧。":
            player worry "I must be so exhausted and anxious about the coding stuff that I'm hallucinating about Mint writing code."
            player relieved "在{b}精力{/b}耗尽前再睡会吧。"
            hide mint_with_pixel_sunglasses
            return # return control to the script that called this label

        "这不可能是梦。我得弄清楚发生了什么。":
            pass

    player neutral "不这不是梦得搞清楚。"
    player "What I've gathered from what I've seen is that Mint is a coding whiz..."
    player laugh "And isn't that awesome? I mean, I have a {bt}pretty code-y cat myself{/bt}!"
    player smile "嘿Mint！有空吗？"
    player neutral "……"
    player "(Mint is still staring determinedly at the laptop and not responding to me.)"
    player smile "Oh, well, I guess this could be Mint's way of telling me to keep this secret?"
    player "（我得小心选择别惹Mint不高兴。）"

    call save_reminder from _call_save_reminder_16

    menu:
        player "Shall I keep this as a secret just between Mint and me?"
    
        "Let's keep this a secret and say goodnight to Mint.":
            player "好Mint你很棒继续做你的事。"
            player "有一天我会赶上你。"
            player laugh "晚安！"
            hide mint_with_pixel_sunglasses
            return
    
        "But it's such a loss for the world if people don't know about Mint!":
            pass

    player happy "（Mint的才华被埋没太可惜了，我们一起创造历史！）"
    player "嘿Mint！介意我加入跟你学编程吗？"

    $ player_glasses = 'player_pixelsunglasses'

    player "来我也弄了同款墨镜。"
    player laugh "戴着怎么样？"
    mint "Meow! (Looks great!)"
    player "喜欢吗？谢谢Mint！"
    mint "Meow! (Now let's get to work!)"
    player "你让我现在开始工作？好我尽力！"
    $ calendar_enabled = False

    call screen text_over_black_bg_screen("一个月后……")
    scene bg hall with fade
    host "And now let's give a round of applause to the winning team: {b}The Code-y Cats{/b}!"
    play sound 'audio/sfx/applause.ogg'
    show mint_with_pixel_sunglasses
    player laugh "哇……多亏Mint我们得了第一名太棒了！"
    host "We hope to see you at our next hackathon as well!"

    call screen text_over_black_bg_screen("一年后……")
    scene bg hall_audience with fade
    play sound 'audio/sfx/applause.ogg'
    show woman orange
    journalist "Did you see that person and the cat there? They are the famous {b}The Code-y Cats{/b}!"
    show girl flipped red at left with moveinleft
    college_girl "这就是在各种黑客马拉松拿奖的团队？"
    show boy red at right with moveinright
    boy "太厉害了！"
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
    player surprised "听起来很酷……"
    mom "我知道你在自学编程可能占用时间。"
    mom "由你决定不给你压力。"
    player smile "(Mom's as considerate and resourceful as always.)"

    menu:
        player "(Should I take up the CS tutor gig?)"
    
        "为什么不呢？教是学的最好方式！":    
            pass
    
        "不。我已经忙着自学了。":
            player neutral "谢谢妈妈我自学太忙了这次算了。"
            mom "别担心亲爱的需要什么告诉我。"
            return

    player happy "谢谢妈妈听起来有趣很乐意试试。"
    mom "好明天跟我去学校吧？"
    player "会的！"

    $ calendar.next()
    scene bg classroom with fade
    show boy purple with moveinleft
    boy "大家安静回座位！"
    boy "听说要来新辅导老师教编程。"
    hide boy with moveoutright
    player happy "大家好。我是[player_name]。我是今天的计算机科学导师。"
    player smile "直接开始！谁能告诉我什么是计算机程序？"
    girl "我知道！像手机上的应用！"
    boy "还有电子游戏！"
    girl "呃。又是电子游戏的话题。你能说点别的吗？"
    player surprised "(Wow. The kids sure are energetic. And smart, too!)"
    player "好都是好答案现在让我给出定义……"

    scene bg classroom dusk with fadehold
    boy "今天太感谢了！很有趣！"
    girl "学到很多！希望再见！"

    scene bg kitchen dusk with fadehold
    mom "喜欢教学吗[player_name]？"
    mom "I heard that the kids loved you and the school would like you to come every day if that works for your schedule."
    player neutral "（很有趣但也很辛苦。）"
    player "（但如果每天都要来就没时间学编程成为开发者了。）"
    player "(That said, am I that hellbent on becoming a developer? Wouldn't it be fun to pass along my coding knowledge?)"
    player "（坚持学编程还是继续教编程？）"
    player "（这是很重要决定需要好好考虑。）"

    call save_reminder from _call_save_reminder_17

    menu:
        player "(Should I stick to learning to code, or continue to teach coding?)"
    
        "Let's stick to learning to code and become a developer.":
            player "对，不该忘记最初的目标。"
            player "(要成为优秀开发者需要努力。)"
            mom "亲爱的很安静不用急着决定。"
            player smile "谢谢妈妈已经决定了。"
            player "坚持原计划学编程找超棒的开发者工作。"
            mom "怎样都为你高兴亲爱的今晚好好休息。"
            return

        "Let's teach coding and pass along the torch.":
            pass

    $ calendar_enabled = False
    call screen text_over_black_bg_screen("一个月后……")
    scene bg classroom with fade
    player happy "这就是for循环的原理都清楚了吗？"
    boy "This for loop thing is amazing! {b}For{/b} each enemy in the game, I'm gonna beat 'em up!"
    girl "... {b}For{/b} each time you mention video games, I'm gonna tell you to cut it out."
    player laugh "我们{b}跳出{/b}for循环继续好吗？"

    call screen text_over_black_bg_screen("一年后……")
    scene bg classroom with fade
    # actually meets Layla who volunteers here
    player smile "听说今天有特别嘉宾。"
    player "她是热爱教学和志愿服务的开发者。"
    player "她会给班级讲软件工程工作是什么样的。"
    player "（哦她来了！）"
    show layla
    player surprised "（等等看起来很眼熟。）"
    player "（……哦！那是她在黑客空间指导孩子吗？）"
    player "（没记错的话……）"

    scene bg hacker_space with fadehold
    show layla
    layla @ laugh "大家的项目进展如何？我们导师在这里回答任何问题！"

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
    player relieved "（Layla看起来对现状很满意，但我确实想知道如果选了不同会怎样？）"

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
            player "消息已删除，继续过我的一天。"
            hide smartphone
            return

    hide smartphone

    player "看看邮件也无妨。"
    player "嗯……他们说看了申请觉得我合适，但这是简单的办公室工作谁都可以做。"
    player "技术最复杂的事大概就是电子表格。"
    player "但工资还算不错……"
    player "也许做几个月看看？"
    player "（这是很重要决定需要好好考虑。）"

    call save_reminder from _call_save_reminder_18

    menu:
        "Should I accept the office job?"
    
        "It pays okay so why not?":
            pass
    
        "Nah. I want to become a developer, not an office worker.":
            player "对，不该忘记最初的目标。"
            player "要成为优秀开发者需要努力。"
            player "消息已删除，继续过我的一天。"
            return

    $ calendar_enabled = False
    call screen text_over_black_bg_screen("一周后……")
    scene bg cubicle with fade
    player neutral "（好在新办公室工作。）"
    office_worker "Hey you there. Come with me to fix the fax machine now."
    player surprised "Uhhh okay!"
    player worry "（跟想象一样无聊。）"
    player "（但人穷志短吧……）"

    call screen text_over_black_bg_screen("一年后……")
    scene bg cubicle with fade
    player neutral "（一年了，还在这份办公室工作。）"
    player "(The work is boring and mentally draining, so I come home everyday too exhausted to do anything else.)"
    player @ pout "（天哪好久都没精力玩游戏了更别说业余时间学编程。）"
    office_worker "Hey you. Stop daydreaming. The boss wants this presentation slide deck done today."
    player "哦抱歉，我会尽快完成。"

    call screen text_over_black_bg_screen("两年后……")
    scene bg cubicle with fade
    player neutral "（已经两年了？）"
    player "（我在这里，还做着这份办公室工作。）"
    player "（事到如今去留已经不由我了。）"
    player pout "（做表格和幻灯片是我唯一的技能了。）"
    player worry "(Ugh. And making coffee as well.)"
    player relieved "（大概就这样了？除非……）"

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
    
        "听起来是个好计划！":
            pass
    
        "开玩笑的！":
            player relieved "呃……希望我是在开玩笑。"
            show mint
            mint "喵！"
            player smile "哦Mint你是想告诉我不要放弃吗？"
            player "哇谢谢Mint，你不放弃我就不放弃。"
            hide mint
            player neutral "好不错的玩笑但不切实际。"
            player "去公园散个步庆祝大自然吧。"
            call day_activity_park from _call_day_activity_park_2
            $ player_stats.change_stats_random(ENERGY, 5, 20)
            return

    $ calendar_enabled = False
    $ player_base = 'player_overall'
    $ player_glasses = None

    scene bg farm with fade
    player happy "哇！这农场好大！比电影里看到的还大！"
    player "看来这里就是我的新家了。"
    player pout "可惜Mint不能一起来，我会想家的。"
    player smile "随时可以回去看看，在这拍些照片发回家吧！"

    call screen text_over_black_bg_screen("一年后……")
    scene bg farm with fade
    player happy "在农场已经一年了。"
    player "一天从挤牛奶收鸡蛋开始。"
    player "然后照料蔬菜。"
    player "不知不觉就到黄昏。"

    play sound 'audio/sfx/cricket.ogg'
    scene bg farm dusk with fade
    player laugh "农场黄昏时真美，云彩变成千种温暖的色调。"
    scene bg farm night with fade
    player "有时晚上有篝火和烤棉花糖。"
    player happy "太享受农场生活了，短期内不想回城市……"

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
    "这样结束故事也不错。"
    "But if you think about it, would you have wanted something different?"
    "Would it be possible to teach yourself to code and fulfill your dream of becoming a developer?"
    "Do you wish for an ending like that?"
    "好告诉你个小秘密。"
    "如果你愿意可以倒回时间重新审视做过的选择。"
    "If I may ask, did you remember to {b}Save{/b} your progress before making this choice that has taken you here?"
    call screen confirm(_("保存进度了想读取回到过去吗？（回答不也行我会告诉你另一个秘密。）"), 
        yes_action=[ShowMenu('load'), Return()], 
        no_action=Return())

    # if the player didn't load, they get down here
    "Interesting. It looks I have no choice but to let you in on my other little secret."
    "Listen up, alright? I can offer you a second chance to go back to the day you made the choice that took you here."
    "That is, if you so wish."
    "Now answer me this, would you like to get a second chance?"
    menu:
        "Would you like to go back in time and revisit your choice?"
    
        "时间旅行！来吧。":
            "知道火箭船那句话吗？'如果你被提供了火箭船的座位，别问哪个座位。'"
            "让我们回到过去勇敢的旅行者。"
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
    
        "不用，我对现在很满意。":
            "佛祖说过'没有通往幸福的路，幸福本身就是路。'"
            "很高兴你对自己的现状满意。"
            "I hope this has been a pleasant ride for you, brave traveler."
            "下次见！"
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
    "你可能想知道接下来做什么？"
    "Well, here are a bunch of things you can do."

    default post_game_choices = set()
    menu post_game_choice:
        set post_game_choices
        "以下是一些完成游戏后可以做的有趣事情，选择一项了解更多。"

        "Check out your achievements and tweet ":
            "社交起来！你在游戏中取得了很大进展是时候传播出去了。"
            "You can view your achievements on the {b}Bonus > Achievements{/b} screen. Click on the {b}Tweet{/b} button next to the achievement to tweet it."
            "If you see a lock next to the achievement, backtrack to some point in the game, try different choices, and see if you can unlock it."
            call screen achievements_screen()
            "能解锁所有成就吗？这是个挑战。"
            jump post_game_choice

        "Rate and review this game on itch.io ":
            "Help us improve the game by rating and reviewing [learn_to_code_rpg_on_itch]."
            show itch_rate at truecenter with zoomin
            "You can find the {b}Rate Game{/b} button in the top right corner of the itch.io game page."
            "Refer to {a=https://itch.io/updates/you-can-now-rate-games}this itch.io article{/a} for more details."
            hide itch_rate
            menu:
                "Would you mind taking a minute to rate and review us?"
                "当然！带我去那个页面。":
                    "谢谢！这是链接。"
                "已经做过了！" if not persistent.has_rated_and_reviewed_on_itch:
                    "Awesome. Thank you for your input!"
                    $ persistent.has_rated_and_reviewed_on_itch = True
                "下次吧 :)":
                    "Of course! Take your time to explore and enjoy the game. You can visit this link anytime from the {b}Bonus{/b} screen."
            jump post_game_choice

        "Star the game's source code on GitHub ":
            "Interested in learning about how this game is built? Take a peek into our source code by visiting [learn_to_code_rpg_on_github]."
            show github_star at truecenter with zoomin
            "Better yet, {b}Star{/b} our repository for your reference and {b}Watch{/b} for updates!"
            "Refer to {a=https://docs.github.com/en/get-started/exploring-projects-on-github/saving-repositories-with-stars}this GitHub article{/a} for more details."
            hide github_star
            menu:
                "Would you like to check out our GitHub repository?"
                "当然！带我去那个页面。":
                    "谢谢！这是链接。"
                "已经做过了！" if not persistent.has_visited_github:
                    "Awesome. Enjoy digging through the source code!"
                    $ persistent.has_visited_github = True
                "下次吧 :)":
                    "Of course! Take your time to explore and enjoy the game. You can visit this link anytime from the {b}Bonus{/b} screen."
            jump post_game_choice

        # "Support this game and other freeCodeCamp.org projects by donating ":
        #     "This game was made possible by all the kind people who donate to support [freeCodeCamp]."
        #     "You can help support our nonprofit's mission {a=https://www.freecodecamp.org/news/how-to-donate-to-free-code-camp/}by donating to us here{/a}."
        #     "Remember you can visit link anytime from the {b}Bonus{/b} screen."
        #     jump post_game_choice
        
        # "Check out the bonus screen for minigames, resources, and more ":
        #     "Did you have the chance to enjoy the rhythm minigame while you were busy learning to code, visiting the Hacker Space, and serving coffee?"
        #     "Are you interested in checking out the actual [freeCodeCamp] curriculum and teach yourself to code in real life?"
        #     "你运气好，{b}奖励{/b}屏幕有你需要的所有东西。"
        #     # go to the bonus screen
        #     call screen bonus_screen()
        #     "一定会好好利用奖励内容的！"
        #     jump post_game_choice

        "Discover alternative endings ":
            "Which ending took you here, if I may ask?"
            "你如愿成为开发者了吗？还是做了其他工作？"
            "Perhaps you discovered that Mint, your adorable home cat, is better at coding than you?"
            "Psssst... Did I just spoil the fact that there are several alternative endings hidden in the game?"
            "The endings you unlocked will be displayed on the {b}Bonus > Achievements{/b} screen."
            "想解锁全部记得经常{b}保存{/b}！"
            jump post_game_choice

        "收到，准备好自己探索了！":
            "Great to hear! Hope you enjoyed the ride!"
            
    return # return to main menu
