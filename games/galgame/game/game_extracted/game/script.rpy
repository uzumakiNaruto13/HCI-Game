label start:
    stop music fadeout 2.0
    scene bg laptop_screen with dissolve

    # get some action and conflict in here :)
    interviewer "So - are you feeling excited?"
    player "U-um... I definitely am. I'm just a bit nervous..."
    interviewer "Don't sweat it! Everyone gets nervous during the interviews - even the pros."
    interviewer "How about we start with your name?"
    # TODO: more customization like gender, pronouns, life story

    $ player_name = renpy.input(_("你的名字？{color=[red]}*{/color}（输入名字后回车，名字将在整个游戏中使用，除非开始新游戏否则无法更改。）"), default=_("Lydia"))
    $ player_name = player_name.strip()
    if player_name in vip_names:
        $ vip_profile_url = vip_names[player_name]
        "[player_name]？真巧！VIP团队成员{a=[vip_profile_url]}[player_name]{/a}听到会很高兴。"
        # TODO: Easter Egg
    # handle empty string case by assigning default name
    if not player_name:
        $ player_name = _("[player_name]")

    interviewer "It's nice to meet you, [player_name]! So I understand that you're here for our coding interview?"
    player "我怕"

    menu:
        interviewer "Great! We'll start whenever you're ready."

        "Guess I have no other options. Let's start!":
            pass

    # timed menu
    $ timeout = 5.0
    # Set the label that is jumped to if the player doesn't make a decision.
    $ timeout_label = "start_interview_question2"
    interviewer "First question."
    menu:
        interviewer "Assuming P = NP, how many raccoons is too many raccoons?"

        "Banana nuts":
            pass
    
        "I don't know":
            pass
    
        "……":
            pass

label start_interview_question2:
    play sound 'audio/sfx/punch.wav'
    with vpunch
    $ timeout_label = "start_interview_question3"
    "Second question."
    menu:
        interviewer "In Python, what is a generator?"
    
        "Banana nuts":
            pass
    
        "I don't know":
            pass
    
        "……":
            pass

label start_interview_question3:
    play sound 'audio/sfx/punch.wav'
    with hpunch
    $ timeout_label = "start_after_interview"
    "Third question."
    menu:
        interviewer "How do you think Sasquatch feels about APIs?"
    
        "Banana nuts":
            pass
    
        "I don't know":
            pass
    
        "……":
            pass

label start_after_interview:
    # reset to non-timed choices
    $ timeout_label = None
    play sound 'audio/sfx/punch.wav'
    with vpunch

    interviewer "Thanks for taking the time to complete our coding interview."
    interviewer "Before you go, please take some time to fill in your basic information so we can get to know you better."
    interviewer "The fields marked with {color=[red]}*{/color} are required."

    # TODO: birthday Easter Egg
    # "你的生日是什么？"

    # TODO
    # player_pronouns = renpy.input("你希望用什么代词？")

    # questions with no substantial consequences
    menu:
        interviewer "How did you hear about this opportunity?"
    
        "Email":
            interviewer "Cool! We're glad that you're here!"
    
        "Career fair":
            interviewer "Awesome! Career fairs are great places to find opportunities."

        "Job posting websites":
            interviewer "Ah - I knew it'd be worth getting our recruiters to post on those sites!"

        "Referral":
            $ referral_name = renpy.input(_("推荐人的名字是什么？（输入后回车）"))
            # Easter egg :)
            if referral_name in vip_names:
                $ vip_profile_url = vip_names[referral_name]
                play sound 'audio/sfx/system_processing.wav'
                "系统处理中……看来你是VIP团队成员推荐的，太棒了！我们会在你的资料中突出显示。"
                "我们会让VIP团队成员{a=[vip_profile_url]}[referral_name]{/a}知道的！"
           
                $ add_achievement(plot_vip)
            else:
                "嗯……在员工数据库中找不到这个人，也许打错了？"

        "Others (Please specify)":
            $ renpy.input(_("你是怎么知道我们的？（输入后回车）"))
            "不太确定你是怎么通过指定渠道找到这个机会的，但很高兴你来了！"

    menu:
        interviewer "Would you like to opt in to our recruiting email list?"
    
        "Yes":
            "Way to go! We'll notify you about all the events and opportunities."
    
        "No":
            "Maybe next time?"
    
    interviewer "And that'll be all! Thanks so much for coming, [player_name]."
    player "N-no, thank you - I appreciate your time."
    interviewer "We'll call you if we decide we'd like to move you forward to the offer stage."
    player "Thank you..."
    player "（天哪……我真的不确定面试表现怎么样！）"
    player "（说实话不久前我还是个完全的新手，看看现在的我！）"
    player "（感觉就像昨天才决定自学编程……）"

label stage1:
    # use call instead of show b/c the screen will return after the timer finishes
    call screen text_over_black_bg_screen(_('About three months ago...'))
    call screen text_over_black_bg_screen(_("{i}Prologue: Chapter 1 - We're just getting started!{/i}"))

    scene bg kid_home
    $ calendar_enabled = True
    # start the music here
    # $ continue_looping_music = True
    $ renpy.music.queue(all_music_files, loop=True, fadein=1.0, tight=True)

    # Stage 1. player background
    show boy orange
    player smile "Okay, we can pick up from here tomorrow."
    kid "Okay - thanks [player_name]! I appreciate the help."
    kid "By the way, I'm going to miss my tutoring session tomorrow, so don't wait up."
    player "What? Mason, are you sure? Your science grades could really use some work."
    player worry "I don't think we should be missing any sessions."
    kid "Nah, you've got it all wrong, Ms. Wallflower - I AM taking science classes!"
    kid "I'm learning how to code in my robotics club after school!"
    player surprised "Robotics? Jeez... that sounds harder than your advanced physics class."
    kid "I know - I was surprised too, but it's actually WAY easier - and way more fun!"
    kid "I get to learn to program, like my older brother. He's a software engineer."
    kid "My teachers told me that if I take this elective, I'm off the hook for advanced physics."
    player "Oh yeah?"
    kid "Yep! And I've been thinking... I really like this stuff. Maybe I'll do it when I grow up?"
    kid "Anyway, see you Ms. Wallflower!"
    player smile "Bye Mason."
    player neutral "（天哪……Mason才16岁就知道自己想做什么了？）"
    player worry "（毕业8个月了还不知道方向。）"
    player "（同届的好像都安定下来了。）"
    player sweat "（辅导工作还行能让我忙起来但挣得不够多……）"
    player -sweat neutral "（漫长的一天回家了。）"

label stage2:
    # Stage 2. player's decision to learn to code
    # player returns home
    scene bg living_room night with blinds

    player "Mom, Dad, I'm home!"
    dad "[player_name]! How's my little Tulip?"
    player sweat "Dad! Aren't I a bit old for you to be calling me that?"
    dad "哎呀你永远不会太大！我还叫你妈Rosie呢，不是吗亲爱的？"
    mom "You sure do! I love it as much as I did when we first started going steady..."
    player "（天哪他俩还是那么恩爱。）"
    player "（换个话题吧。）"
    player -sweat smile "你们俩今天在忙什么？"
    dad "哦！刚从Anderson家回来聊Jerry——记得Jerry吗？"
    player surprised "记得四岁时偷我蜡笔。"
    player "在说偷蜡笔的Jerry？"
    mom "亲爱的得放下了。"
    dad "嗯Jerry刚从大学毕业就找到了第一份工作，你绝对猜不到他是做什么的！"
    player sweat smile "……以偷蜡笔为生？"
    mom "He's a software engineer!"
    player -sweat surprised "Really? Jerry? Jerry Anderson?"
    mom "是啊！他父母说他很喜欢我一直好奇电脑高手做什么。"
    mom "Something amazing, I'm sure!"
    mom "Anyway, ready for dinner?"
    player "（嗯……又一个程序员？奇怪大家都中bug了……）"
    player smile "（嘿电脑bug。）"
    mom "[player_name]？我问你饿了吗？"
    player "哦对！好的妈妈谢谢。"

    play sound 'audio/sfx/kitchen_beep.ogg'

    # dinner scene
    scene bg kitchen night with blinds
    play sound 'audio/sfx/dining_ambient.wav'
    $ show_random_dinner_image()
    dad "我今天最精彩的部分……"
    player laugh "哈哈太搞笑了！"
    mom "周末有什么计划？"
    player "我什么都行！"

    scene bg bedroom with blinds
    player "Phew - I'm stuffed!"
    mint "喵！"
    player "嘿Mint！我最爱的猫咪好吗？"
    mint "喵！"
    mint "喵？"
    player "是啊……今天有点沮丧。"
    player "开始觉得辅导不够了Mint。"
    player "Mom and Dad don't mind me living here at all, but want to be able to help out, at least a little."
    player worry "挣的钱勉强够付电话费。"
    player worry "也许除了辅导还得再找份工作现在每周只有几次。"
    player neutral "注册求职网站设通知。"
    player "……"
    player "……"
    player surprised "哇——这么快就有回复了？"
    player surprised "Should I pick up?"
    menu:
        "Check phone":
            show smartphone
            player smile "Looks like I was right - the local cafe down the street is hiring right now."
            player smile "It looks like they'd like me to come in for an interview. Maybe I can work there?"
            player "It's right down the road, so I'd just have to walk."
            hide smartphone
            "（恭喜！你做出了第一个选择。）"
            "（选择会影响游戏进程和故事发展。）"
            "（不一定有对错之分……只有后果或奖励！）"
        "Ignore":
            mint "喵！"
            player "你说得对Mint。"
            player "虽然很累但真得看看……"
            show smartphone
            player "Looks like I was right - the local cafe down the street is hiring right now."
            player "It looks like they'd like me to come in for an interview. Maybe I can work there?"
            player "就在路边走路就到。"
            hide smartphone
            "（恭喜！你做出了第一个选择。）"
            "（选择会影响游戏进程和故事发展。）"
            "（不一定有对错之分……只有后果或奖励！）"
    player relieved "Phew! I guess it's a good thing that I answered!"
    player "差点错过机会继续闷闷不乐。"
    "（[player_name]说得对：当你即将做出选择、开始新章节或只是为了安全起见时，保存进度是个好主意。）"
    "（你可以点击屏幕右下角的{b}保存{/b}按钮进行保存。）"
    "（你想现在保存进度吗？）"
    "（感谢你接受友好的保存提醒！现在回到故事……）"
    play sound 'audio/sfx/social_media_notification.wav'
    show smartphone at truecenter
    player "什么？又一条通知？"
    player "……"
    player "哦——是Jerry。"
    player "他在新办公室发自拍。"
    player "看起来很酷景色真好！"
    player "First Mason, and now Jerry? It seems like everyone is learning to program."
    player "六个月自学然后几乎六位数工作？"
    player "Mason才16岁就能学……"
    player "而Jerry Anderson是……"
    player "……JERRY！"
    player "那也许我也能做到？"
    mint "喵！"
    player "Mint你相信我吗？"
    player "谢谢。"
    player "（爸妈很支持但Mint可能是搬回家最大原因。）"
    player smile "（看那双小眼睛和肉垫！）"
    player smile "(It's hard to tell her “no” most of the time. Not that I want to.)"
    player "（好吧——做了决定。）"
    player smile "（我要去做！我也要学编程。）"
    player "（明天早上开始。）"
    player "好了Mint——睡觉吧明天有面试。"
    player "学习时总得赚钱养活自己对吧？"
    mint "喵！"

    call save_reminder from _call_save_reminder

    call screen text_over_black_bg_screen(_('{i}Prologue: Chapter 2 - Piping hot!{/i}'))
    $ calendar.next()
    scene black
    scene bg bedroom with eyeopen

    player neutral "哈欠"
    play sound "audio/sfx/meow1.wav"
    show mint
    player "早上好Mint！"
    mint "喵！"
    hide mint
    player "今天编程之旅开始！"
    player smile "睡了一觉现在很兴奋。"
    player "面试前还有时间先研究一下没坏处。"
    player neutral "从哪开始？也许该像别人一样找免费在线资源。"
    player "哦——有个关于今年十大技术技能的视频看看！"

    # now the quick menu screen show the button to access stats
    $ stats_unlocked = True

    player smile "用手机记录进度。"
    show smartphone at truecenter
    "（点击文本框右下角的{icon=icon-smartphone}{b}状态{/b}按钮查看你的进度。）"
    "（在那里，你可以追踪你所学的内容、你的精力以及其他有用的信息。）"

    hide smartphone
    player "好了试试看……"
    player "……"

label stage2_stats_change:
    player surprised "好吧……JavaScript和Java是不同的语言？真的？"
    $ player_stats.change_stats(CS_KNOWLEDGE, 1)
    player neutral "哦——一个做网页一个做手机应用哪个是哪个？"
    $ player_stats.change_stats(ENERGY, -5)

    player "还有print语句和print()函数一个是Python2一个是Python3？"
    player "How many Pythons {i}are{/i} there, exactly?"
    player "两条蛇已经太多了……"
    $ player_stats.change_stats(CS_KNOWLEDGE, 1)
    player "记得有视频说Python2过时了是不是不用学？"
    $ player_stats.change_stats(ENERGY, -5)

    player "也许Python3也不用费心。"
    $ player_stats.change_stats(CS_KNOWLEDGE, 1)
    player "所以说Python2过时了不用学？"
    player worry "Python3也跳过？什么时候出Python4？"
    player "可能还没等我学就有人认为Python3太老套。"
    $ player_stats.change_stats(ENERGY, -5)

    player "嗯……看起来Java也老也许同理不用学？"
    $ player_stats.change_stats(CS_KNOWLEDGE, 1)
    player 'It says on this website that people nowadays are hyped up about something called, "Kotlin"?'
    player "听起来像感冒吃的非处方药。"
    $ player_stats.change_stats(ENERGY, -5)

    player surprised "等等……还有JavaScript和TypeScript？有多少种？"
    $ player_stats.change_stats(CS_KNOWLEDGE, 1)
    player worry "都是表亲吗？"
    $ player_stats.change_stats(ENERGY, -5)

    player "也许找喜欢的职位学那些技能。"
    play sound 'audio/sfx/punch.wav'
    with hpunch
    player pout "但前端后端全栈是什么？有什么区别？"
    player "查一个发现两个不认识再查发现更多。"
    play sound 'audio/sfx/punch.wav'
    with hpunch
    player "DevOps和网络安全是什么？"
    play sound 'audio/sfx/punch.wav'
    with hpunch
    player "这里还说有公司用着没人用的自创编程语言？"
    player "他们为什么这样做？"

    # hard-reset player's CS knowledge :)
    $ player_stats.set_stats(CS_KNOWLEDGE, 0)

    with vpunch
    play sound 'audio/sfx/stats_change_doom.wav'
    player "呃……太令人沮丧了！" 
    player worry "天哪……也许编程不适合我？太难了？"
    show mint 
    mint "喵！"
    player neutral "怎么了Mint？吓到你了吗？对不起……"
    mint "喵！"
    player "嗯？哦！要迟到了！得赶紧去面试——谢谢提醒Mint！"
    mint "喵。"
    hide mint

label stage3:
    # Stage 3. Annika
    call screen text_over_black_bg_screen(_('{i}Prologue: Chapter 3 - Everyone could use a friend like Annika.{/i}'))
    call screen text_over_black_bg_screen(_('Four days later...'))
    scene bg cafe with fadehold

    player smile "Thanks! Come again!"
    player neutral "（哇——才几天就感觉会做所有咖啡了。）"
    player "（免费咖啡不错，但闻了这么久有点腻了，也许该去休息一下？）"

    show smartphone at truecenter
    play sound "<to 2.0>audio/sfx/phone_ring.wav"

    player "时机刚好是谁呢？"
    annika "[player_name]!"
    hide smartphone
    show annika
    player smile "Annika？"
    player happy "哇好久不见！最近怎么样？"
    player neutral "毕业后搬家就没见了！爸妈很想你来玩！"
    annika laugh "拜托——从小看到大了！你妈肯定高兴我现在不把泥巴踩进你家。"
    player laugh "嘿那是团队协作污渍不全是你弄的！"
    player neutral "最近忙什么？找工作顺利吗？"
    annika "好得不得了——你都想不到多好！"
    player happy "别卖关子！怎么回事？"
    annika "我刚收到offer！"
    player happy "哦？" 
    annika "是啊！不是随便的——是网页开发offer！"
    player surprised "网页开发？真的？！"
    player neutral "（最近怎么都学编程了？）"
    player "我以为你是平面设计？"
    annika "确实是！但我在玩自己构思的网站UI设计发网上被招聘人员看到了！"
    annika "聊起来经过筛选他们决定要我！"
    player smile "哇！"
    player neutral "用户界面设计是什么？整天做什么？"
    annika "哦太酷了！基本上就是……"
    "（听着Annika兴奋地谈论新工作，你为她无比高兴，但心里还是有沉重感。）"
    player surprised "哇。"
    player pout "那……太好了。"
    annika "嘿——怎么了？"
    annika "你听起来像把冰淇淋掉地上了。"
    player  "现在有冰淇淋就好了。"
    player "目前在咖啡店工作——闻了一整天咖啡！"
    player "只是心烦因为……嗯……"
    player "你和其他几个我认识或遇到的人都在学编程。"
    player "昨晚查了资料什么都没记住。"
    player "我就是不适合。"
    annika @ laugh "什么？！[player_name]不是！"
    annika "你真是我认识最聪明的人之一！上次听说你找到辅导工作？"
    annika "做那个必须很聪明才行。"
    player pout "我不知道……不兴奋就很难感觉好。" 
    player pout "你说工作时整个人都在发光我也想要那样的。" 
    annika "[player_name]..."
    annika "听着——你会是很好的开发者如果这真是你想做的，"
    annika "我会一路支持你！"
    player smile "哇……真的？你愿意为我这么做？"
    annika "当然！那次打翻你妈花瓶是你替我顶的。"
    player laugh "我不得不那样！"
    player neutral "不然她得禁止你进门一周！"
    annika "一切都会好的[player_name]其实有个超酷东西给你看。"
    annika "大概三天后才有空到时候有能帮你实现编程目标的东西！"
    annika "相信我？"
    player neutral "……"
    player laugh "有你这样的活力很难不相信！"
    annika "好棒！"
    annika "得走了——午休快结束了。"
    annika "见面前你可以做——有个很棒的网站叫developerquiz.org。"
    annika "有免费编程练习题——每天做几道入门！"
    player neutral "好但不知道答案呢？"
    annika "简单！freeCodeCamp！"
    player "免费……什么？"
    annika "freeCodeCamp！完全免费学编程的了不起网站！"
    annika "我就是用它找到现在工作的。" 
    annika "上了响应式网页设计课程几个月密集学习后就能面试了。"
    player "真的？仅仅几个月？"
    annika "嗯……学编程更像马拉松不是赛跑付出多少得到多少。"
    annika "好了！总之——得走了。"
    annika "试试网站！听到技术流行语见面时问我好吗？"
    player smile "好谢谢Annika。" 
    annika "随时壁花小姐！"

    scene bg cafe with dissolve

    player neutral "（好了快下班了。）"
    player "（跟Annika聊天又让我兴奋起来了！）"
    player "（她说听到不懂的可以问她解释，）"
    player "（但她挂电话前说了什么？）"
    player "（响应式网页设计？）"
    player "（我知道网页设计是什么，但'响应式'是什么意思？）"

    "（你刚收集了一个流行语！流行语是IT圈里很流行的词汇。）" 
    "（听到流行语时记得加到待办列表，然后问Annika。）"
    player "仔细想想也许我位置理想每天都有很多带电脑的人。"
    player "大学时常去咖啡店工作也许开发者也喜欢？"

    show girl flipped red at left
    show boy orange at right
    girl "嘿！听说学校要开电脑俱乐部了？"
    boy "什么？不会吧——电脑俱乐部做什么？打很多游戏？"
    girl "更好——可以学编程甚至做自己的游戏！"
    boy "酷！俱乐部现在学什么？"
    girl "We're learning about Python! Mr. Stevens runs the club, and he says that we should have a {bt}Hackathon{/bt} so we can all practice."
    boy "黑客马拉松？那是什么……？"
    girl "嗯据我了解……"
    hide girl
    hide boy

    player surprised "哎呀不是故意偷听那些孩子但记得读过HTML和CSS——只是不知道它们之间有什么关系。"
    player smile "知道了！再建个待办问Annika。" 

    $ todo_list.add_todo(todo_ask_hackathon)
    $ topics_to_ask.add('Hackathon')
    player "好了！回去上班。"

    $ add_achievement(plot_barista_discover)

    player neutral "好了——该回家了！"

    call save_reminder from _call_save_reminder_1

label stage4:
    # player goes back home
    scene bg bedroom with fadehold
    player relieved "呼……今天工作真长。"

    show smartphone at truecenter
    play sound "<to 2.0>audio/sfx/phone_ring.wav"
    play sound "<to 2.0>audio/sfx/phone_dial_tone.wav"
    player "嗯？会是谁呢？"
    pause 2.0
    hide smartphone

    show annika
    pause 1.0
    annika "嘿超级明星！现在方便说话吗？"
    player laugh "当然！刚下班怎么了？想我了？"
    annika "Ha-ha. You're acting like you don't want the link to the {bt}best programming resource{/bt} that I know!"
    player laugh "好了好了！不逗了——叫什么？"
    annika "就是这个叫[freeCodeCamp]的网站你说今晚想学习所以确保你知道名字！"
    player laugh "谢谢Annika我会的！你最好了！"
    hide smartphone
    hide annika

    player "（加到待办列表。）"

    $ todo_unlocked = True
    $ todo_list.add_todo(todo_check_fcc)
    "（在{icon=icon-smartphone}{b}状态{/b}屏幕上，你可以在显示状态和显示待办事项列表之间切换。）"

    scene bg laptop_screen night with dissolve
    player neutral "看看Annika说的那个很棒的资源。"

    menu stage4_guess_name:
        player "它叫什么来着？"

        "免费好东西":
            player pout "名字听起来不对。"
            player "记忆一定在捉弄我。"
            jump stage4_guess_name

        "酷码农营":
            player pout "名字听起来不对。"
            player "记忆一定在捉弄我。"
            jump stage4_guess_name

        "freeCodeCamp":
            pass

label stage5:
    player smile "[freeCodeCamp]听着对了！看看。"
    show fcc_curriculum at truecenter with dissolve
    player happy "Wow. Their curriculum is super comprehensive. They also offer certifications that I can showcase on my résumé. Neat!"
    player "从哪开始？"
    hide fcc_curriculum

    # booleans mark whether a choice has been visited
    default stage5_choose_curriculum_visited = set()

    menu stage5_choose_curriculum:
        set stage5_choose_curriculum_visited

        "Responsive Web Design":
            player pout "嗯……Annika说的就是这个……我能跟得上吗？"
            player "再看看别的？"
            jump stage5_choose_curriculum

        "JavaScript Algorithms and Data Structures":
            player pout "记得听说过JavaScript，等等也许那是Java？"
            player "算法和数据结构听起来像数学……我数学还行但不是我喜欢的科目。"
            player "What other curriculum options do I have?"
            jump stage5_choose_curriculum

        "Front End Development Libraries" :
            player pout "前端开发？有意思……有前端一定有后端对吧？"
            player "甚至还有中间部分？"
            player "嗯……看看还有什么。"
            jump stage5_choose_curriculum

        # not enough space on small devices
        "Data Visualization" if not renpy.variant("small"):
            player pout "我知道大数据很火，但没有博士学位真的能做吗？"
            player 'How big is "big" data anyway? Trucks are big. Maybe it\'s truckloads of data?'
            jump stage5_choose_curriculum

        "Back End Development and APIs":
            player pout "我猜找到前端的后端了！它们听起来确实是一起的。"
            player "也许两者都学太贪心了？对工作内容一无所知……"
            player "找点更简单的。"
            jump stage5_choose_curriculum

        "Quality Assurance":
            player pout "质量保证？听起来像在数字传送带上确保饼干包装重量一致。"
            player happy "温暖有嚼劲的饼干……我爱饼干，希望妈妈厨房饼干罐里还有。"
            show mint
            mint "喵？"
            player "嘿Mint，你也想要饼干吗？"
            mint "喵喵~"
            hide mint
            menu:
                "Let's go grab a cookie from the kitchen":
                    call stage5_cookie from _call_stage5_cookie

                "Enough cookie talk! Let's go back to studying":
                    pass

            with vpunch
            player pout "等等分心了，我在哪？在浏览课程类别？哦，打开着质量保证标签。"
            player "不管怎样我觉得质量保证不是我想学的。"
            jump stage5_choose_curriculum

        # "Scientific Computing with Python":
        #     player pout "科学计算？我不太是科学型的人也不觉得自己会成为科学家。"
        #     player "而且我还完全不懂Python。"
        #     jump stage5_choose_curriculum

        "Data Analysis with Python":
            player "数据分析听起来很酷……"
            player pout "但我不喜欢蛇，知道它们不该黏糊糊的但看起来那样……"
            jump stage5_choose_curriculum

        # "Information Security":
        #     player pout "学了信息安全之后能做什么？"
        #     player "黑别人的电脑？阻止攻击者黑别人的电脑？"
        #     player "听起来很紧张，不确定自己能不能应付。"
        #     player "列表里有什么更中性的吗？"
        #     jump stage5_choose_curriculum

        "Machine Learning with Python":
            player happy "机器学习，哇听起来很酷。"
            player "我对教机器学习很感兴趣。"
            player "想想看，教机器像人一样聊天……也许能让它帮我预约医生？"
            player "难怪最近大家都对人工智能这么热衷。"
            player "……"
            player pout "但看起来很难，我对机器学习一无所知除了很多表情包说就是数学。"
            player "数学……线性代数……那类东西。"
            player "我确定能做到，但问题是我想整天做这个吗？"
            player "也许从更基础的开始？"
            jump stage5_choose_curriculum

        "Let's just wait until tomorrow and ask Annika for advice":
            player pout "嗯……我自己能做的基本都研究完了。"
            player neutral "开始碰壁了，也许该让Annika参与进来。"
            $ todo_list.add_todo(todo_ask_curriculum)
            player smile "Added it to my To-Do list!"
            player "今天确实完成了些事，至少知道[freeCodeCamp]的课程是什么了，从待办划掉一项。"
            $ todo_list.complete_todo(todo_check_fcc)
            show mint
            mint "喵！"
            player smile "Mint你也觉得这是个好主意？"
            player relieved "好，休息吧，明天又是新的一天。"
            hide mint

            call save_reminder from _call_save_reminder_2

            jump stage5_annika

label stage5_cookie:
    scene bg kitchen night with blinds
    dad "嘿郁金香——学习累了在休息？"
    mom "你爸和我很高兴你大学后还继续学习，但别太勉强自己好吗？"
    player happy "哈哈谢谢妈妈，我挺好的。"
    player "我在决定学什么计算机课题才能像Annika一样找到科技工作。"
    dad "哦，Annika现在有计算机科学工作了？真好！"
    mom "我绝对相信你也能做到，记住我们永远在这里如果你想聊天、发泄或要拥抱。"
    player "我会的谢谢妈妈。"
    mom "睡前——我做了饼干！带回房间学习时吃吧？"

    scene bg bedroom with blinds
    show cookie at truecenter
    pause 0.2
    play sound 'audio/sfx/chew_food.wav'
    player laugh "嗯……妈妈的饼干最好吃了。"
    hide cookie

    $ add_achievement(plot_cookie)
    return

label stage5_annika:
    # the next day
    $ calendar.next()
    scene black
    scene bg bedroom with eyeopen

    show smartphone at truecenter
    play sound 'audio/sfx/alarm.wav'
    pause 1.0
    hide smartphone
    
    player pout "啊……闹钟……已经是新的一天了？"
    player smile "今天待办列表上有什么？"
    $ renpy.show_screen(PLAYER_PHONE_SCREEN, _layer='transient', tab_showing=TODO)
    player happy "对——给Annika打电话问问计算机课程。"
    show smartphone at truecenter
    play sound "<to 2.0>audio/sfx/phone_dial_tone.wav"
    hide smartphone

    show annika

    player happy "早上好Annika！"
    annika @ laugh "早上好！一如既往精力充沛。"
    player "哈哈都多亏了你！"
    annika "怎么了？"
    player "照你说的看了[freeCodeCamp]。"
    player "我觉得课程看起来挺扎实的。"
    player pout "问题是我不知道该学什么，网页开发、数据科学、机器学习……"
    player "看起来都超复杂，你完成每个证书一定付出了很多。"
    player "提醒我——你学的是哪个？"

    annika "哦，我学了网页设计那个。叫什么来着？{a=https://www.freecodecamp.org/learn/responsive-web-design/}响应式网页设计{/a}？"
    annika "大学计算机辅修还记住的就是那些网页标记语言了。"
    player "啊明白了。"
    player pout "（Annika能完成课程是因为大学有些经验，加上设计天赋。）"
    player worry "（我不像她……我绝对做不到……）"

    annika "嘿壁花小姐——我知道你在想什么。"
    annika '"她大学学的就是相关的东西——对她来说一定很容易！"'
    player "……"
    player sweat smile "被你看穿了。"
    player "（我讨厌她这样！）"
    annika "听着——看课程是向前一大步。"
    annika "你在试水！在决定是否喜欢。"

    show annika serious
    annika "相信我，我刚开始时跟你一样。"
    annika "我一无所知就联系了[freeCodeCamp]的在线社区。"
    annika "记得我说的[developerquiz]资源吗？"
    annika "开始用了吗？我大学推荐的。"
    annika "我觉得那些小测验有趣且容易消化。"
    annika "而且覆盖了很多基础计算机知识，可以看作新手入门课程。"
    annika "听起来怎么样？"

    player worry "呃……即使有那个，我也不确定能独立完成所有测验和概念……"
    player pout "遇到不理解的东西怎么办？"
    player worry "测验像大学时一样难失去动力怎么办？"

    show annika
    annika "完全没问题！我喜欢[freeCodeCamp]的原因就是有整个社区帮你加油。"
    show annika laugh
    annika "我告诉过你——{b}我们是责任伙伴！{/b}你不是一个人。"
    player happy "谢谢Annika，我知道可以依靠你。"
    annika "随时！"

    show annika
    annika "我要去上班了回头聊！"
    player laugh "工作顺利！告诉我进展。"

    play sound 'audio/sfx/phone_hangup.wav'
    hide annika

    player smile "好问完课程了待办划掉一项。"
    $ todo_list.complete_todo(todo_ask_curriculum)
    player "可以改天再问Annika其他话题。"
    player "新待办是提升计算机知识。"
    $ todo_list.add_todo(todo_learn_cs)
    player happy "Sounds like a plan!"
    player "该去咖啡师班了。"

    call save_reminder from _call_save_reminder_3

    # I think that we should have more to this scene rather than just adding it in to have content.
    # We want to see something happen here. We can add something on a second pass :)
    # scene bg cafe with fadehold
    # play sound 'audio/sfx/cafe_pour.wav'
    # show coffee at truecenter
    # pause 5
    # hide coffee

    # player neutral "奇怪……今天咖啡馆人不多。"
    # player relieved "也许因为是工作日？哦好吧。"
    # player laugh "多给我咖啡！"

    # scene bg cafe dusk with fadehold
    # play sound 'audio/sfx/cafe_pour.wav'
    # show coffee at truecenter
    # pause 5
    # hide coffee
    # player "轮到我了，没什么事。"
    # player "早点回家晚上学习保持动力！"

label stage6:
    # Stage 6. Trials
    call screen text_over_black_bg_screen(_("{i}Prologue: Chapter 4 - Feeding the study bug{/i}"))

    scene bg bedroom with fade
    player smile "终于到家了！去[developerquiz]试试测验题。"
    scene bg laptop_screen with dissolve
    player surprised "他们把问题分成了HTML、CSS、JavaScript等子类别。"

    # unlock CS Knowledge subcategories here
    $ player_stats.subcategory_stats_map = {stats_name: 0 for stats_name in v1_skills}
    $ renpy.show_screen(PLAYER_PHONE_SCREEN, _layer='transient')

    player smile "我需要追踪每个子类别的进度。"
    "（你的{b}计算机知识{/b}按所有子类别平均计算，所以确保每个类别都学！）"
    player "每次要完成所选类别的四道选择题。"
    player happy "试试看！"

    call study_session_choose_topic from _call_study_session_choose_topic_2
    call study_session from _call_study_session

    $ add_achievement(milestone_start_curriculum)

    "（恭喜开始编程之旅！路很长但最终值得。）" 
    "（无论学编程是为了新工作、转行、做梦想应用还是好玩，freeCodeCamp RPG和社区都在这里帮你。）"
    "（最有效的方式是边玩边学！每天和[player_name]一起答题，既能学习也能发现需要改进的地方。）" 
    "（答错或不理解概念别灰心！）"
    "(Just click the “Learn More” button if you get a question wrong. We recommend clicking it when you get something right, too - it never hurts to review!)"
    "（卡住或灰心随时在论坛联系freeCodeCamp社区。）"
    "（记住——你和[player_name]的旅程以及你自己的编程之旅才刚刚开始！及时行乐！）"
    "（编程快乐！）"

    scene bg bedroom with dissolve
    player relieved "呼……终于做完题了，多么充实的一天……"
    player "累了……也许还不是开发者，"
    player smile "但比以往任何时候都更有动力做出积极改变！"
    player "也许为了效率最好花一整天学习？"
    player "明天试试。"
    show mint
    mint "喵~"
    player smile "你是想对我说'做得好'吗？哇谢谢Mint。"
    player "晚安Mint。"
    hide mint

    scene black with eyeclose

    call save_reminder from _call_save_reminder_4

    # a new day, player studies in the morning, and hangs out with Annika at night
    $ calendar.next()
    scene black
    scene bg bedroom with eyeopen

    show smartphone at truecenter
    play sound 'audio/sfx/alarm.wav'
    pause 1.0
    hide smartphone

    show mint
    mint "喵~"
    player relieved "打呵欠……你也早上好Mint。"
    player smile "好，快速吃个早餐然后开始学习。"
    hide mint

    scene bg kitchen with blinds
    player happy "早上好妈妈，早上好爸爸。"
    dad "早上好小南瓜。"
    mom "早上好亲爱的，睡得好吗？"
    player laugh "是的，为新的一天充满电了。"
    dad "好！不好好休息拼命工作会事倍功半。"
    mom "一起吃早餐吧？跟我们说说你最近在学什么。"

    show toast at truecenter
    pause 0.2
    play sound 'audio/sfx/chew_food.wav'
    player "好吃好吃。"
    hide toast

    scene bg bedroom with blinds

    player smile "好，早餐吃完了，开始工作。"
    player "希望今天能答对更多题。"

    call study_session_choose_topic from _call_study_session_choose_topic_3
    call study_session from _call_study_session_2

    scene bg bedroom with dissolve

    player happy "好！上午差不多了，感觉整天专注一件事效率高多了。"    
    player "交替全天工作和全天学习。"
    player "下午Annika下班后可以给她打电话，聊聊天问问东西。"

    scene bg bedroom with fadehold

    show smartphone at truecenter
    play sound "<to 2.0>audio/sfx/phone_ring.wav"
    play sound "<to 2.0>audio/sfx/phone_dial_tone.wav"
    pause 2.0
    hide smartphone

    show annika
    pause 1.0
    player smile "嘿Annika！现在方便说话吗？"

    show annika laugh
    annika "嘿[player_name]！正好，我刚下班。"
    annika "第一天学习怎么样？"
    player "今天感觉挺高效的，测验题能给即时反馈真好。"
    player happy "你今天呢？工作怎么样？"
    annika "不错！在学公司用的自定义Web开发框架。"
    annika "跟我自己项目用的很不一样有时有点困惑，但同事说练多了就好。"
    player "听起来不错！"

    show annika
    annika "是啊！听到关于这个框架的好评，主要是在本地黑客空间遇到的人说的。"
    annika "对想在黑客马拉松测试项目想法的人来说这很流行。"
    player neutral "（{b}黑客马拉松{/b}！提醒我了得问问Annika。）"
    player "（她刚还提到了{b}黑客空间{/b}，也值得问问。）"

    show annika laugh
    annika "喂？[player_name]在吗？"
    player happy "哈哈别担心我在，只是在想事情。"

    show annika
    annika "什么事？"

    # booleans mark whether a choice has been visited
    default stage6_annika_questions_visited = set()

    menu stage6_annika_questions:
        set stage6_annika_questions_visited

        "What topic to ask Annika about?"

        "Hackathon":
            call ask_hackathon from _call_ask_hackathon
            jump stage6_annika_questions

        "Hacker Space":
            player "你说的黑客空间是什么？"
            annika "就是对科技感兴趣的人随便聚聚的地方。"
            annika "有时间强烈建议去看看！"
            player worry "嗯……"
            annika @ laugh "哈哈别担心我知道你在想什么，黑客空间不是给网络犯罪黑客的。"
            annika "是让人聚在一起工作和构建酷项目的休闲空间。"
            annika "知道吗？在黑客空间可能找到跟你一样学编程的人，完全可以成为学习伙伴！"
            player smile "听起来不错改天去。"
            annika "耶！我们该一起去。"

            jump stage6_annika_questions

        "That's everything I need to know":
            jump stage6_after_annika_questions

label stage6_after_annika_questions:
    player laugh "就这些了，非常感谢回答我的问题！"
    annika @ laugh "随时！你很快就能成为这些科技文化术语的专家。"
    annika "好了，学了一天一定累了，享受放松的夜晚！"
    player happy "哈哈谢谢Annika，你也是，晚安明天工作顺利！"

    hide annika
    play sound 'audio/sfx/phone_hangup.wav'

    player smile "呼，好多知识要消化。"
    dad "晚饭好了[player_name]！"
    player surprised "（哇，今晚爸爸做饭？他大概一个月做一两次但做的时候通常很好吃。）"
    player laugh "来了！"

    # dinner scene
    scene bg kitchen night with blinds
    play sound 'audio/sfx/dining_ambient.wav'
    $ show_random_dinner_image()
    mom "嘿亲爱的，咖啡师工作做得怎么样？如果太影响学习可以不去你知道。"
    dad "你妈妈说得对，我们随时支持你。"
    player smile "谢谢爸妈别担心，偶尔从学习中休息一下也挺好。"
    player "而且很多科技人来咖啡馆聊很多酷东西。"
    player "就像前几天听到人们谈论黑客马拉松，今天有机会问了Annika。"
    dad "听到这个真好小南瓜，Annika最近忙什么？你们大学时很要好对吧？"
    player happy "你不会相信的！她不是计算机专业但现在有份很酷的科技工作……"
    player "……她自学了一切……"
    with vpunch
    player laugh "……我要像她一样努力！"
    dad "就是这种精神！"
    scene bg kitchen night with fadehold

    scene bg bedroom with blinds
    player pout "打呵欠……多好的一天大脑做了很好的锻炼。"
    player "睁不开眼了今天就到这里。"
    player smile "晚安Mint。"
    show mint
    mint "喵~"
    hide mint

    scene black with eyeclose

    call save_reminder from _call_save_reminder_5

    # two days of activity of the player's choosing
    call day_start from _call_day_start
    call day_activity_choices from _call_day_activity_choices

    call day_start from _call_day_start_1
    call day_activity_choices from _call_day_activity_choices_1

    call save_reminder from _call_save_reminder_6

    # hacker space story
    $ calendar.next()
    scene black
    scene bg bedroom with eyeopen

    show smartphone at truecenter
    play sound "<to 2.0>audio/sfx/phone_ring.wav"
    play sound "<to 2.0>audio/sfx/phone_dial_tone.wav"
    pause 2.0
    hide smartphone

    pause 1.0
    annika @ laugh "早上好瞌睡虫！"
    player relieved "Man, you are up {i}early{/i}."
    player "我只在甜甜圈店半价日看到你这么兴奋。"
    annika "I {i}am{/i} a donut fiend. What can I say?"
    annika "但今天不是去吃甜甜圈！我说过一起去黑客空间看看，记得吗？"
    annika "准备好出发了吗？"
    player laugh "是的！带路吧。"

    scene bg hacker_space with blinds
    play sound 'audio/sfx/office_ambient.wav'

    show annika
    annika @ laugh "我们到了！"
    player surprised "哇这个地方好大，漂亮又现代。"
    annika "是啊！所以本地黑客喜欢来这里。"
    annika "到处走走看看大家在做什么？"
    player laugh "听起来不错！"

    scene bg hacker_space with fade
    show boy red
    college_boy "我最近读这篇研究论文，突然想到也许能用代码实现这个想法……"

    scene bg hacker_space with fade
    show girl purple flipped at left
    show boy orange at right
    girl "上次黑客马拉松很有趣！"
    boy "是啊！我觉得可以把原型发展成更好的东西。"
    girl "当然——告诉我你怎么想。"
    boy "好，计划是这样的……"

    scene bg hacker_space with fade
    show girl red flipped at left
    show woman blue at right
    college_girl "前几天有面试有点恐怖……"
    college_girl "他们要我在白板上写代码然后在没有编译器的情况下目测……"
    female "别担心！我相信你做得很好！"
    college_girl "……"
    female "我在招聘部门工作过，告诉你一些面试官的秘密……"

    scene bg hacker_space dusk with fadehold
    show annika
    annika "你觉得这地方怎么样[player_name]？"
    player laugh "太棒了！"
    player "这地方充满活力……像每走一步都能看到有趣的东西。"
    annika @ laugh "就是这种精神！"
    annika "你觉得以后会常来吗？"
    player happy "当然！"
    player "谢谢你带我来！"
    annika "随时！"

    $ add_achievement(plot_hackerspace_discover)

    scene bg bedroom with blinds
    player smile "哇太惊讶了，黑客空间确实很酷，改天一定自己来看看。"
    player "今天就到这里休息吧。"

    $ has_visited_hacker_space_with_annika = True

    call save_reminder from _call_save_reminder_7

    # two days of activity of the player's choosing
    call day_start from _call_day_start_2
    call day_activity_choices from _call_day_activity_choices_2

    call day_start from _call_day_start_3
    call day_activity_choices from _call_day_activity_choices_3

    call save_reminder from _call_save_reminder_8

    # two days of activity of the player's choosing
    call day_start from _call_day_start_9
    call day_activity_choices from _call_day_activity_choices_12

    call day_start from _call_day_start_11
    call day_activity_choices from _call_day_activity_choices_13

    call save_reminder from _call_save_reminder_20

    $ calendar.next_week()
    scene bg bedroom with dissolve
    player smile "学编程一段时间了，不仅在课程上进步、参观黑客空间，还一直在和[freeCodeCamp]在线社区互动。"
    player "我找到一个人用[freeCodeCamp]从零自学编程。"
    player "真是个从零到英雄的故事。"
    player "他现在是高级软件工程师，决定回馈社区。"
    player happy "他说我可以问他任何问题所以试试看。"    

label stage7:
    # Stage 7. Marco
    call screen text_over_black_bg_screen(_('{i}Prologue: Chapter 5 - Oh mentor, my mentor!{/i}'))

    $ has_met_marco = True # unlocks Marco's topics_to_ask

    scene bg desk with blinds
    show marco laugh
    marco "Hi [player_name]. I'm Marco. I'm a senior engineer at {b}QuicheQubit{/b}."
    player smile "嗨Marco，很高兴认识你！我是[player_name]刚毕业想成为开发者。"
    marco "听起来不错。"

    show marco neutral
    marco "我先说说自己吧？然后你可以随便问关于我、工作或技术的问题。"
    player "听起来不错。"

    show marco laugh
    marco "很长的故事一路颠簸，系好安全带。"

    show marco neutral
    marco "大约十年前大学毕业，主修音乐所以毕业后做了自由音频工程师。"
    marco "自由职业起初给了我自由和灵活性，但很快发现技能不够精湛无法吸引大客户。"
    show marco serious
    marco "和小客户合作报酬不高给新手自由职业者很大压力。"
    player worry "（太对了……这就是我对辅导工作的感觉……）"
    marco "所以决定提升技能尝试新东西。"
    marco "学了网站设计在当地小公司找到相关工作。"
    player surprised "（这转折不错！）"
    show marco neutral
    marco "你知道小公司里每个人都什么都做一点。"
    marco "因网页设计技能被招但偶尔被要求写HTML、CSS和JavaScript来展示设计效果。"
    marco "那些年学了一点HTML、CSS和JavaScript觉得很有趣。"
    marco "I then found out that there is a term for these skills – front-end development."
    marco "我想酷，做过前端开发也许能成为全职前端开发者。"
    marco "开始研究自学前端，那时互联网资源远没今天多必须非常自给自足制定学习路径。"
    player "（制定完整学习路径对我听起来很紧张但Marco说得好像很容易……）"
    marco "当在现在公司找到前端开发工作时一切都值了，一直在这里，好文化聪明人有趣工作。"
    show marco laugh
    marco "更好的是工作不断挑战我学新技能和成长。"
    marco "刚入职一年团队需要移动开发者。"
    marco "觉得移动开发有趣跟经理谈了能带薪学习移动开发。"
    marco "几个个人项目后转到了移动开发所以现在我是一名移动开发者。"
    player laugh "哇！太棒了！"
    show marco neutral
    marco "是啊我知道，回头看像一团迷雾。"
    marco "这就是我的故事，你还想了解更多吗？"
    player smile "（现在轮到我提问了！）"

    # initialize all choices to False
    default marco_story_choices = set()
    menu marco_story_choices:
        set marco_story_choices
        "你现在在忙什么？":
            player "你现在在忙什么？"
            marco 'You want a one-word answer? Learning. Everyone I know would probably give you the same answer if you asked.'
            marco 'There should never be a point that you want to stop!'
            jump marco_story_choices

        "作为高级工程师还有很多要学吗？":
            player "作为高级工程师还有很多要学吗？"
            marco "当然！日常工作中仍会遇到不知道的技术和工具。"
            jump marco_story_choices

        "和有计算机学位vs没有学位的人工作有什么经验？":
            player "和有计算机学位vs没有学位的人工作有什么经验？"
            marco "我觉得差别不大，计算机学位可能第一年给你领先但之后靠你自己持续学习适应新技术。"
            jump marco_story_choices

        "有喜欢的副项目吗？":
            player "有喜欢的副项目吗？"
            marco "现在在做一个，绝密，看到就知道了。"
            marco "我说过我大学主修设计和音乐，是让我早上起床的两件事。"
            marco "现在我也学会编程了，是把热情投入工作创造很棒东西（比如游戏）的完美时机，可以自己做美术、音乐和编程。"
            player "听起来确实有趣！希望哪天能看到！"
            jump marco_story_choices

        "问完了！":
            player laugh "我问完了！就这些，非常感谢分享！"
            show marco laugh
            marco "随时[player_name]，编程愉快随时告诉我进展！"

    scene bg bedroom with blinds
    player smile "Marco确实很酷有他做导师真幸运。"
    player "现在有任何问题可以问Annika或Marco。"
    show mint
    player laugh "哇Mint你为我在科技圈交到朋友骄傲吗？"
    mint "喵！"
    player "哈哈晚安Mint。"
    hide mint

    scene black with eyeclose

    call save_reminder from _call_save_reminder_9

    $ num_three_day_sessions = 0
    while num_three_day_sessions < 3:
        $ num_three_day_sessions += 1
        # three days of activity of the player's choosing
        call day_start from _call_day_start_4
        call day_activity_choices from _call_day_activity_choices_4

        call day_start from _call_day_start_5
        call day_activity_choices from _call_day_activity_choices_5

        call day_start from _call_day_start_12
        call day_activity_choices from _call_day_activity_choices_14

        call save_reminder from _call_save_reminder_10

    $ calendar.next_month()
    $ renpy.show_screen(PLAYER_PHONE_SCREEN, _layer='transient')
    scene bg bedroom with fadehold
    player smile "学编程快两个月了时间过得真快。"
    player "比刚开始时知识丰富多了。"

    window hide
    show smartphone at truecenter
    play sound "<to 2.0>audio/sfx/phone_ring.wav"
    play sound "<to 2.0>audio/sfx/phone_dial_tone.wav"
    pause 2.0
    hide smartphone

    show annika
    pause 1.0
    annika "嘿[player_name]！今天有空吗？"
    player smile "嘿Annika有空调出来，怎么了？"

    annika @ laugh "Guess what? It's almost {bt}Hacktober{/bt}. The Hacker Space is holding a special hackathon for high school students."

    show annika
    annika "他们需要志愿者帮忙。"
    annika "想今天一起去看看吗？"
    player @ laugh "听起来不错！一会儿见！"

    scene bg hacker_space with blinds
    play sound 'audio/sfx/office_ambient.wav'
    player surprised "比平时更挤了……"
    annika @ laugh "高中生们对这个活动都很兴奋！"

    scene bg hacker_space with blinds
    show boy blue flipped at left with moveinleft
    show girl red at right with moveinright
    boy "终于到了把这个超棒想法变成现实的时候了！"
    girl "是啊一直是个空中楼阁。"
    boy "这次终于要全写出来了！"
    girl "嗯……可能需要些建议，听说有导师指导……"

    $ has_met_layla = True
    show layla with moveinleft
    layla @ laugh "嘿大家！听说你们在找导师帮忙。"
    layla "我是Layla今天的导师之一很乐意和你们合作。"
    boy "酷谢谢！"
    girl "现在真觉得一切会很顺利！"

    scene bg hacker_space with blinds
    show annika with moveinright
    annika "你看到那边指导高中生的女士了吗？"
    annika "她看起来经验丰富。"
    player surprised "还有活力！我高中时需要很多努力才能集中注意力。"
    annika "我也是！指导孩子看起来有趣希望有一天也能做。"
    player smile "耶！传递火炬回馈社会觉得这已经是科技文化了。"
    annika @ laugh "哈哈现在说话像在科技界待了很久一样，才学两月不算坏事。"
    annika "你确实内化了很多科技文化和价值观。"
    player "去黑客空间确实有帮助，多亏你和在线导师Marco。"
    annika "这提醒我了和Marco进展如何？还定期联系吗？"
    player "对，最近在聊编程面试他说技能到位后可以开始找工作。"
    player "哦想问你面试经历是怎样的？"
    annika @ laugh "哈哈说来话长先喝杯咖啡吧。"

    scene bg hacker_space_cafe with fadehold

    show annika serious
    annika "好这就是我的面试经历。"
    annika "I polished my résumé and applied to as many online positions as I could."
    annika "I also had to highlight parts of my résumé that were specific to the requirements of the jobs I was applying to."
    annika "然后是漫长等待期间在白板上练习编程面试题。"
    player surprised "白板？"
    annika @ neutral "是啊差点忘了提，你可能以为科技公司用超级花哨工具筛选候选人吧？"
    annika "实际上很多科技公司想测试你在没有任何帮助的情况下写代码的能力。"
    annika "比如没有代码搜索、文档或IDE支持。"
    player "嗯？"
    menu:    
        "等等什么是IDE？":
            annika "是集成开发环境的缩写，你知道像Python的PyCharm、Java的IntelliJ等。"
            player smile "好的明白了。"
    
        "嗯……有意思":
            pass
    annika @ neutral "在白板上写代码意味着你得熟悉语法但别担心公司通常让你选熟悉的语言。"
    annika "更棘手的是你可能需要自己想测试用例逐行跟踪执行并验证结果。"
    annika "如果代码有bug还需要在白板上调试没有IDE调试器的便利。"
    player worry "（听起来很紧张……）"
    annika @ laugh "哈哈别怕那基本就是编程面试最可怕的部分没更可怕的了！"
    annika "There's no shortcut to coding interview prep though, I'd say. I know it's cliché but I'll leave you with the phrase, practice makes perfect."
    player neutral "Hmmm... I see."

    show annika
    annika "还有关于编程面试的问题吗？"

    # booleans mark whether a choice has been visited
    default stage7_coding_interview_questions_visited = set()
    menu stage7_coding_interview_questions:
        set stage7_coding_interview_questions_visited

        "还有关于编程面试的问题吗？"
    
        "整个面试流程是怎样的？":
            annika "看情况公司可能有多轮面试和不同招聘流程。"
            annika "面试流程可能从在线评估开始通常叫OA。"
            annika "就像一个在线IDE你在里面解决给出的问题。"
            annika "如果能解决问题在在线评估中表现好可能收到招聘人员通知进入电话筛选。"
            annika "可能是信息会与招聘人员或工程师的行为面试或与工程师的技术面试。"
            annika "表现好进入下一步通常会有不止一轮电话技术面试。"
            annika "最后一旦通过电话筛选最终挑战是现场面试。"
            annika "通常现场面试一整天与工程师和工程经理交流。"
            annika "现场面试可能听起来吓人但其实是了解公司文化和工程师日常的好方式。"
            annika "流程大概就是这样。"
            jump stage7_coding_interview_questions
    
        "面试后会发生什么？":
            annika "通常几天内能收到招聘人员回复。"
            annika "最好耐心等待不要急着发邮件但有例外。"
            annika "如果因待定offer或其他同时面试需要立即回复可以联系招聘人员。"
            annika "我就是这样收到另一家offer但还在当前公司面试中联系他们加快流程然后现在在梦想公司！"
            jump stage7_coding_interview_questions

        "问完了！":
            pass

    player smile "谢谢就这些了！"
    annika "没问题！准备面试顺利！"
    hide annika

    call save_reminder from _call_save_reminder_11

    scene bg bedroom with blinds
    player relieved "今天从Annika那学到了很多关于编程面试流程的知识。"
    player laugh "多到等不及完成课程就去体验真正的编程面试！"
    player smile "听说[developerquiz]会给课程取得重大进展的人发邮件通知。"
    player "看看我的进度。"
    if player_stats.player_stats_map[CS_KNOWLEDGE] < cs_knowledge_threshold:
        player "嗯……还需要提升计算机知识，明天继续学习。"
        "(Try bumping your {b}CS Knowledge{/b} to above [cs_knowledge_threshold] by completing more quizzes.)"

    while player_stats.player_stats_map[CS_KNOWLEDGE] < cs_knowledge_threshold:
        call day_start from _call_day_start_6
        call day_activity_choices from _call_day_activity_choices_6

    call save_reminder from _call_save_reminder_12

    # once we are down here, we should have player_stats.player_stats_map[CS_KNOWLEDGE] >= cs_knowledge_threshold
    player laugh "看来进步不少！不知道什么时候能收到那封邮件。"
    player "但先来个电影之夜庆祝已完成的事！"

    scene bg bedroom with fadehold
    $ renpy.show_screen(PLAYER_PHONE_SCREEN, _layer='transient')

label stage7_complete_curriculum:
    play sound 'audio/sfx/social_media_notification.wav'
    player surprised "嗯……手机通知？这么早？"
    player "写着{bt}恭喜！{/bt}……？"
    $ has_completed_curriculum = True

    $ completed_curriculum_date = date(calendar.get_year(), calendar.get_month(), calendar.get_day())
    $ days_between_start_and_curriculum_completion = (completed_curriculum_date - start_date).days

    $ add_achievement(
        achievement_name=milestone_complete_curriculum,
        title=_("{bt}恭喜！{/bt}"),
        message=_("You completed the coding curriculum in {b}{color=#002ead}[days_between_start_and_curriculum_completion]{/color}{/b} days.\nNow you are ready to rock your coding interviews and realize your dream of becoming a software engineer.\n Feel free to share your progress with the world!"),
        ok_text=_("让我们搞定那些面试！"),
        show_achievements_count=False
        )

    player laugh "太棒了！把课程从待办划掉。"
    $ todo_list.complete_todo(todo_learn_cs)
    player smile "（也把准备编程面试加到待办。）"
    $ todo_list.add_todo(todo_interview_prep)
    player happy "（还有开始申请工作！）"
    $ todo_list.add_todo(todo_apply_to_jobs)
    player laugh "对学编程的决定感到很棒！"
    player "搞定面试！"

label stage8:
    # Stage 8. Coding interviews
    call screen text_over_black_bg_screen(_("{i}Prologue: Chapter 6 - Let's crush those interviews!{/i}"))

    scene bg bedroom with fadehold
    player smile "好了！从申请工作开始！"
    call day_activity_job_search from _call_day_activity_job_search
    player "已申请第一份工作，从待办划掉。"
    $ todo_list.complete_todo(todo_apply_to_jobs)

    player "待办下一个？哦对，开始准备编程面试。"
    # now change the day activity text for studying
    $ day_activity_study = todo_interview_prep
    player surprised "该学什么？记得职位提到JavaScript、Web开发、算法和系统设计。"

    call study_session_choose_topic from _call_study_session_choose_topic
    call study_session from _call_study_session_3

    $ add_achievement(milestone_start_interview_prep)

    scene bg bedroom with fadehold
    player relieved "呼……这些问题比基础题难，需要多学习。"
    player smile "但仍是好的开始！"
    $ todo_list.complete_todo(todo_interview_prep)
    player "待办下一件大事是通过面试找到工作。"
    $ todo_list.add_todo(todo_get_job)

    player "放松一下看看不在时有没有人发消息。"
    # chat with Marco
    play sound 'audio/sfx/social_media_notification.wav'
    show smartphone at truecenter
    player surprised "嗯，Marco的消息。"
    hide smartphone
    show marco
    marco "嘿[player_name]！今天忙吗？"
    player happy "嘿Marco！是的，刚开始准备面试和申请。"
    marco @ laugh "好的开始！"
    marco @ serious "但公司处理申请通常比较慢，可能需要等一周或更久。"
    marco "所以一时没收到回复别灰心！"
    marco "继续申请、准备面试、保持日常。"
    marco @ laugh "一旦处理完申请开始面试流程，就是你大放异彩的时候！"
    player laugh "哈哈谢谢！会记住的。"
    player "祝你晚上愉快！"
    marco "你也是。"

    play sound 'audio/sfx/phone_hangup.wav'
    hide marco

    player relieved "打呵欠……今天就到这里明天恢复日常吧。"

    scene black with eyeclose

    call save_reminder from _call_save_reminder_13

    call day_start from _call_day_start_8
    call day_activity_choices from _call_day_activity_choices_8
    $ calendar.next_week()

    # loop routine
    # TODO: refactor past demo if we need offer negotiation
    while offer_company_name is None:
        while interview_company_name is None:
            # two free-to-play days in a row
            call day_start from _call_day_start_7
            call day_activity_choices from _call_day_activity_choices_7
            $ calendar.next_week()
            scene black with dissolve
            "（是不是感觉时间飞逝而你没做什么？）"
            "（这就是求职的现实：申请、等回复、面试、等结果、{b}循环{/b}。）"
            "（坚持住好吗？）"

            if interview_company_name is None:
                # go back to job search
                scene bg bedroom with fadehold
                player "今天搜些职位吧。"
                player surprised "看起来有新的职位发布了，去看看。"
                call day_activity_job_search from _call_day_activity_job_search_1

                if num_jobs_applied == 1 and not milestone_first_application in persistent.achievements:
                    $ add_achievement(milestone_first_application)

                call day_activity_choices from _call_day_activity_choices_9

        # receives an email
        scene bg bedroom with fadehold
        show smartphone at truecenter
        play sound 'audio/sfx/alarm.wav'
        pause 3.0
        hide smartphone
        play sound 'audio/sfx/social_media_notification.wav'

        player surprised "嗯一大早来自{b}[interview_company_name]{/b}的邮件？对，申请了有一阵子了。"
        player "标题写着'申请跟进'……"
        $ num_jobs_interviewed += 1

        if num_jobs_interviewed == 1 and not milestone_first_interview in persistent.achievements:
            $ add_achievement(milestone_first_interview)

        call screen company_interview_email_screen(interview_company_name)
        player laugh "我成功了！要去编程面试了！"
        player "要跟Annika和Marco分享这个。"
        play sound 'audio/sfx/smartphone_typing.wav'
        player "好了！趁热打铁，开启这美好的一天！"
        call day_activity_choices from _call_day_activity_choices_10

        # here interview_company_name is not None
        call day_activity_interview from _call_day_activity_interview
        call day_end_interview from _call_day_end_interview

        call day_start from _call_day_start_10
        call day_activity_choices from _call_day_activity_choices_11
        $ calendar.next_week()

        if offer_company_name is None:
            scene bg bedroom with fadehold
            $ num_jobs_rejected += 1
            play sound 'audio/sfx/social_media_notification.wav'
            player surprised "嗯来自{b}[interview_company_name]{/b}的邮件？对，面试一周了。"
            player "The title says 'Interview Follow-up'..."
            player worry "The last thing I need in my inbox is a rejection letter first thing in the morning..."
            player pout "But I have to face it."
            call screen company_rejection_email_screen(interview_company_name)
            player worry "Well... Guess I need to work harder."
            "（嘿别这么沮丧好吗？编程面试很难我们都知道，所以才要好好准备，学习时多做些模拟题吧？）"
            show mint
            mint "喵……"
            player relieved "谢谢Mint，我有点失望但会好起来的。"
            hide mint
            player smile "覆水难收，今天休息明天继续日常吧。"

            if num_jobs_rejected == 1 and not plot_rejection in persistent.achievements:
                $ add_achievement(plot_rejection)

            elif num_jobs_rejected == 3 and not plot_third_rejection in persistent.achievements:
                $ add_achievement(plot_third_rejection)

        # reset interview_company_name to None so we enter the inner loop again
        $ interview_company_name = None

    # once we break out of this loop, show the offer screen
    play sound 'audio/sfx/social_media_notification.wav'
    player surprised "嗯来自{b}[offer_company_name]{/b}的邮件？面试一周了。"
    player "The title says 'Interview Follow-up'..."
    player worry "The last thing I need in my inbox is a rejection letter first thing in the morning..."
    player "But who knows? It could be a request for follow-up interviews, or even better!"
    player relieved "（深呼吸……）"
    player neutral "好，准备好看了。"
    call screen company_offer_email_screen(offer_company_name)
    player surprised "Huh? Is this a dream?"

    show mint with vpunch
    play sound 'audio/sfx/punch.wav'
    mint "喵！"
    player pout "嗷Mint……你好重……别这样扑我好吗？"
    player surprised "等等！Mint刚砸到我身上我感受到了冲击，说明这不是梦。"
    player "So this is real."
    mint "喵喵！"
    hide mint

    player laugh "哇，我做到了，现在是真正的开发者了！"
    play sound 'audio/sfx/applause.ogg'
    $ todo_list.complete_todo(todo_get_job)
    player "别忘了从待办列表划掉。"
    $ accepted_offer_date = date(calendar.get_year(), calendar.get_month(), calendar.get_day())
    $ days_between_start_and_offer = (accepted_offer_date - start_date).days
    $ days_between_curriculum_completion_and_offer = (accepted_offer_date - completed_curriculum_date).days

    $ add_achievement(
        achievement_name=milestone_first_offer,
        title=_("{bt}恭喜！{/bt}"),
        message=_("You taught yourself to become a developer in {b}{color=[dark_blue]}[days_between_start_and_offer]{/color}{/b} days, [days_between_curriculum_completion_and_offer] days after you've completed the coding curriculum.\nYou have applied to [num_jobs_applied] jobs and interviewed for [num_jobs_interviewed] times before landing this offer.\nNow you are ready to rock your new job!\n Feel free to share your progress with the world!"),
        ok_text=_("让我在新工作中大展身手！"),
        show_achievements_count=False
        )

    player happy "等不及告诉爸妈了！还要打给Annika和Marco。"
    player laugh "把大家召集起来开个大派对庆祝！"
    # TODO: congrats from Annika, Marco, and family

    # should be the last save reminder
    call save_reminder from _call_save_reminder_14 

# actually no stages between 8 and 14

label stage14:
    # Stage 14. New hire player meets Layla
    call screen text_over_black_bg_screen(_("{i}Prologue: Chapter 7 - Let's meet my new colleagues!{/i}"))

    $ calendar.next_month() # player's start date is in a month

    scene bg office
    player surprised "哇还是不敢相信从今天起在这么豪华的办公室工作。"
    player smile "入职邮件说我的入职伙伴会来接我带我看办公室……"
    show layla

    layla "嘿[player_name]欢迎加入团队！我是Layla你的入职伙伴。"
    layla @ laugh "随便问任何问题！"
    player surprised "（嗯……以前见过吗？Layla看起来有点眼熟。）"
    player "（……哦！那是她在黑客空间指导孩子吗？）"
    player "（如果记得没错的话……）"
    # TODO: flashback sepia fade
    scene bg hacker_space with fadehold
    show layla
    layla @ laugh "大家的项目进展如何？我们导师在这里回答任何问题！"

    scene bg office with fade
    show layla with vpunch
    layla "[player_name]？你还好吗？走神了。"
    player smile "啊！我没事，只是想起我们可能以前见过。"
    player "你知道在黑客空间，找到这份工作前常去那里学习和做项目。"
    layla "哦哇是啊我参加过几次黑客空间活动很高兴你喜欢那里！"
    layla @ laugh "好了寒暄够了！准备好今天提交第一行生产代码了吗？"
    player surprised "（呃……好快……）"
    player happy "啊……是的想尽快进入代码库！"
    layla "好样的！我们团队通常坐在那张桌子旁白板旁边。"
    player "收到！马上开始！"
    play sound 'audio/sfx/keyboard_typing.wav'

    $ add_achievement(milestone_onboarding)

    scene bg office with fadehold
    show layla
    layla "工作进展如何？已经看完代码库了？"
    player pout "……嗯……"
    layla "有心事？"
    player "有点卡住了……更准确说是不知道从哪开始。"
    layla "别担心！入职可能令人望而生畏。"
    layla "想想看才华横溢的开发者团队花了数月甚至数年构建这个代码库。"
    player smile "哈哈谢谢确实让我感觉好些。"
    layla @ laugh "这样吧？先不想代码去喝杯咖啡。"
    player happy "当然很乐意！"

    scene bg office_cafe with blinds
    show layla
    layla @ laugh "给你从豆到咖啡办公室现煮的。"
    player pout "……"
    player neutral "嘿Layla介意我问你在这公司和团队多久了？"
    layla "当然两年了大学时在这里实习毕业后直接回来全职。"
    player surprised "所以你是计算机专业的？"
    layla "Yep."
    player worry "(No wonder Layla was able to blend in so well...)"

    show layla serious
    layla "请别那样看我'计算机专业的孩子进入科技界一定很容易'对吧？"
    layla "但那不是全部你知道。"
    player pout "哎呀抱歉。"
    layla @ neutral "没什么我能理解你的想法。"
    layla "Have you heard of the term imposter syndrome?"
    menu:
        "Do you know what imposter syndrome is?"
        "是的。":
            player "对，就是那种觉得大家都比你强你是冒牌货的感觉。"
            player worry  "To be honest, I feel that quite often."
        "不。":
            player surprised "Care to explain?"
            layla "就是觉得别人都比你聪明能干。"
            layla "That you are a fraud, despite all of your education and achievements."
            player worry "Uhhh... I know that feeling..."
            layla "Not the best feeling, huh?"
    layla @ neutral "别担心你很棒，这在科技界几乎是常态。"
    layla "Hah. Would you believe me if I told you that imposter syndrome hits CS students equally hard, if not harder?"
    player surprised "Ummm... Tell me about it."
    layla "It starts the first time we step into a CS classroom, maybe earlier."
    layla "There is always that kid that sits in the front row, who has been coding since five and knows everything the professor has yet to talk about."
    player pout "那……挺紧张的。"
    layla "而且有种期望是计算机专业的大一暑假就该有大厂实习。"
    layla "Definitely not later than their junior year summer. Otherwise, the myth goes that they are unhirable."
    layla "I spent my freshman and sophomore summers volunteering at a local school teaching kids to code."
    layla "我倒是觉得没什么问题，我爱编程也爱教学，能把这传给下一代感觉很棒。"
    player smile "（难怪Layla志愿去黑客空间指导孩子。）"
    layla "But my friends were either interning for big name companies or building their own startups during the summer."
    layla "They were nice enough not to say anything to my face, but I always felt a strange sense of hollowness when I saw them post about their intern perks or startup progress."
    layla "It was a rough time, but my friends and my college advisors were supportive, and I eventually come to terms with being who I am and contributing to causes that I care about."
    player pout "（哇……没想到冒名顶替综合征对每个人都这么严重。）"

    show layla neutral
    layla "哈哈抱歉吐槽了，不是想吓你不想继续在科技界工作。"
    layla "只是与冒名顶替综合征的斗争是持续的，每一点小胜利都是胜利。"
    layla "其实我现在还在跟冒名顶替综合征斗争，每次遇到不了解的东西都得忍住不撞桌子。"
    player smile "Wow. Haha. Thanks for sharing. That actually makes me feel a lot better."
    layla @ laugh "You are very welcome."
    layla "So, what else would you like to know about me or my role?"

    default layla_story_choices = set()
    menu layla_story_choices:
        set layla_story_choices
        "What was your experience like when you first joined?":
            player "Would you mind telling me about your experience when you first joined this company?"
            layla @ laugh "没问题！"
            layla "Like you, I also had an on boarding buddy. He was a few years ahead of me. Very knowledgeable and chill guy."
            layla "At his suggestion, I started with simple bug fixes. Then after a month, I started building small features and getting them approved by the team."
            layla "As I became more familiar with the code base, I had more confidence to take on bigger features."
            layla "And before I knew it, here I am, two years in already."
            player "Wow. Time sure flies."
            layla "确实会，你很快就能像专业人士一样浏览代码库。"
            jump layla_story_choices
        "How was your transition from college to work?":
            player "How was your transition from college to work? Was it any easier because of your CS background?"
            layla "Yes and no. My CS background helps a little in that it gave me a general sense of what to expect in the workplace."
            layla "But there are few college CS curricula that can cover the modern principles and best practices in the world of software."
            layla "Which is not a surprise since the tech world is constantly evolving."
            layla "But that also means that, for the most part, I had to pick up the important things on the job."
            layla "Not a bad experience given that I had a supportive team behind me."
            player @ happy "哇真好！"
            layla @ laugh "对，既然你是这里的新人，团队和我都会支持你。"
            jump layla_story_choices
        "What is our team like?":
            player "So what is our team like?"
            layla "哦他们今天出去调查客户案例了所以办公室只有你和我。"
            layla "But you will meet them soon. They are all nice and smart people."
            layla "You and I included, we have five developers in total, one scrum manager, one product manager, one UX designer. That makes us a team of eight."
            player @ laugh "听起来很酷！等不及见团队了。"
            jump layla_story_choices
        "问完了！":
            player @ laugh "问完了！"
            layla @ neutral"嘿嘿[player_name]你是个有趣的人，一定会喜欢开发者工作的。"

    layla @ laugh "Are we now ready to go back and squash some bugs?"
    player laugh "带路！"

label v1_ending:
    scene bg office with fadehold
    player relieved "提交到服务器吧。"
    player neutral "嗯……也许该再检查一遍？"

    $ check_counter = 2 # start on double-checking, go thru double, triple, quadruple
    menu ending_check_code:
        player "Should I check my code some more?"

        "再检查一遍代码！" if check_counter == 2:
            $ check_counter += 1
            player "……"
            player "Looks good to me."
            player "But maybe I should still triple-check it?"
            jump ending_check_code

        "再检查第三遍！" if check_counter == 3:
            $ check_counter += 1
            player "……"
            player "Looks good to me."
            player "But maybe I should still quadruple-check it?"
            jump ending_check_code

        "再检查第四遍！" if check_counter == 4:
            $ check_counter += 1
            player "……"
            player "Looks good to me."
            player relieved "检查了无数次了……"

            $ add_achievement(plot_double_check)
            
            player smile "It should be good to go, right?"
            # proceed with plot

        "Looks good to go!":
            player laugh "确认可以提交了！"
            # proceed with plot

    player "提交到服务器吧。"
    # TODO: system processing animation
    play sound 'audio/sfx/system_processing.wav'
    player neutral "... And nothing happened."
    player worry "Hmm... my changes should at least do something to the code base. Maybe I can check if Layla is in... "

    # stop the music here
    # $ continue_looping_music = False
    stop music fadeout 1.0

    # office red alert animation
    show red_flash    
    play sound 'audio/sfx/error.wav'
    layla "[player_name]? Was that your change a few seconds ago?"
    layla "不会吧……好像有问题……"
    window hide
    pause 4.0
    hide red_flash with dissolve

    $ add_achievement(
        achievement_name=ending_dev,
        title=_("{color=[red]}{icon=icon-alert-triangle} Attention{/color}"),
        message=_("Hey [player_name]... \nThe thing is, it looks like... \n{sc}{color=[red]}YOU HAVE BROUGHT DOWN THE PRODUCTION SERVER{/color}{/sc}"),
        ok_text=_("Oopsy... Am I... fired?"),
        show_achievements_count=False
        )

    show main_menu_v1 with fadehold
    pause 5.0
    # fall through to the next label
    $ calendar.next_month()

label v2_start:
    call screen text_over_black_bg_screen(_("{i}Arc I{/i}"))

    scene bg laptop_screen with dissolve
    ## setup for the case where the player started in v2 without filling in the info in v1
    if player_name == '':
        $ player_name = renpy.input(_("你的名字？{color=[red]}*{/color}（输入名字后回车，名字将在整个游戏中使用，除非开始新游戏否则无法更改。）"), default=_("Lydia"))
        $ player_name = player_name.strip()
        if player_name in vip_names:
            $ vip_profile_url = vip_names[player_name]
            "[player_name]？真巧！VIP团队成员{a=[vip_profile_url]}[player_name]{/a}听到会很高兴。"
            # TODO: Easter Egg
        # handle empty string case by assigning default name
        if not player_name:
            $ player_name = _("[player_name]")

    $ stats_unlocked = True
    $ todo_unlocked = True
    $ items_unlocked = True
    $ quiz_session_questions = persistent.all_quiz_questions
    $ player_stats.subcategory_stats_map = {stats_name: 0 for stats_name in v1_skills}
    ## end v2 setup

    $ player_stats.set_stats(MONEY, 500)
    $ player_stats.set_stats(RENOWN, 20) # start with a bit of renown

    # transition to v2 plot here
    $ calendar.next_weekday()
    $ calendar_enabled = True
    scene bg bedroom with dissolve
    player relieved "A lot has happened in this past month..."
    "(After you broke prod on the first day of work, Layla, the team, and your manager insisted that it was okay, and you didn't have to worry.)"
    "(That being said, they didn't end up renewing your contract.)"
    "(So after applying for a few more jobs, and more long nights of preparation, you landed a new one!)"
    "(You start today as ConsultMe Consulting Company's newest, fulltime, junior full stack engineer!)"

    scene bg company1_reception with fadehold
    play sound 'audio/sfx/office_ambient.wav'
    player surprised "So this is ConsultMe! Wow... It's enormous."
    player smile "I put in the work to become a developer, and today, it's real... "
    player "I'm going to keep working hard and learn everything I can! Doing that is what got me here, so if I keep it up, I should be okay!"    
    player "Um... hello?"
    show maria
    receptionist @ smile "Hello! How can I help you?"
    player "My name is [player_name], and this is my first day."
    receptionist @ laugh "Ah, the new hire! And so punctual too - it's nice to meet you!"
    receptionist smile "My name is Maria, and I'll be showing you around!"
    player "明白了！"

    scene bg company1_center with blinds
    pause 2.0
    scene bg company1_boardroom with blinds
    pause 2.0
    scene bg company1_breakroom with blinds
    pause 2.0
    scene bg company1_dining with blinds

    "You're taken all around the ConsultMe office. There are lots of snacks in the lunch area, and even a gym downstairs!"
    "There are dozens and dozens of meeting rooms, all named after different countries around the world."
    "There's even a nursing room for new mothers!"

    scene bg company1_lydia_cubicle
    show maria
    maria smile "... And this is your cubicle! We even prepared your name plate!"
    player surprised "Wow... it's made of wood! This is so nice."
    maria laugh "I'm glad you like it! Do you have any questions so far? I know I've been hitting you with a lot of information."
    player smile "No no, everything has been awesome so far!"
    maria "Great! The last leg of our tour involves me handing you off to our engineering manager, Iris!"

    scene bg company1_center with blinds
    show maria at left with moveinleft
    show iris with moveinright
    iris "Hello. And who is this again?"
    maria @ smile "Iris, don't be silly! This is [player_name]! The new hire?"
    iris disgust "Hm... I see."
    player worry sweat "（天哪……这女人……好可怕。）"
    player worry "（工作几年了但这女人让我感觉自己像个不知所措的高中生。）"
    player "Um... hi. My name is... um... [player_name]..."
    iris confused '"Um[player_name]"? What a strange name.'
    player "Um... no, it's -"
    iris "Maria, please introduce... Um[player_name] to Goro. He can get her set up."
    iris "If you'll excuse me. I don't have much time for pleasantries."
    hide iris   
    player "... "
    player -sweat "Ooookay. So. Who's Goro?"
    show goro at right with moveinright
    goro @ smile "That'd be me."
    player surprised "哦！你好！"
    goro disgust "Don't mind Iris. She's... prickly on the outside. But she can be really nice once you get to know her."
    player smile "Sure... I'm [player_name]. It's nice to meet you!"
    goro smile "Awesome to meet you, [player_name]! I'm Goro - I'll be your team lead for any projects moving forward."
    goro laugh "I've been around the bend a few times, and I'm a little {i}less prickly{/i} than Iris. So feel free to ask me any questions that you might have."
    player smile "Thanks! I appreciate it."
    goro smile "We've also got the rest of the team to meet too. First there's Mala, and she's probably somewhere around - "
    show mala at center with moveinleft
    mala laugh "I heard my name! What's up old man?"
    goro angry "That's no way to greet our new hire!"
    goro smile "[player_name], this is Mala. Mala, this is our new hire, [player_name]."
    mala smile "Oooh! A freshman! We haven't gotten a new fish in ages!" # Ed: I'm not sure if freshman is the right way to describe a new hire. I've only heard it used for high school and college students.
    player smile sweat "鱼？"
    mala laugh "Yeah! Hello? You're a freshman! A little fish out of water."
    player laugh -sweat "I wasn't even called a fish in college!"
    goro smile "Don't freak her out, Mala."
    goro "Mala's a big ball of energy. She's a great resource if you need any help."
    player "Gotcha. Thanks for helping me out!"
    mala smile "没问题！"
    mala smile "I've gotta run - but I'll see you two in stand-up, right Goro?"
    goro smile "You know it. See you later, Mala."
    maria laugh "You guys are always good for a laugh! I've gotta go, too."
    maria "I'll be around if you ever have any questions, or just want to grab some lunch, okay [player_name]?"
    maria smile "I'll leave you all to it - have a nice day!"
    player smile "Thanks Maria - see you around!"
    hide maria at right with moveoutright
    hide mala at left with moveoutleft
    player neutral "(Hm... stand-up? I've never heard that term before.)"
    goro "Well that was good timing. But you still haven't met - "
    show darius at left with moveinleft
    darius "Goro! Oliver bet that Mala could get more JIRA tickets done than I could!"
    darius "Can you {i}believe{/i} that man?"
    show oliver at center with moveinright
    oliver "It's nothing personal, mate - I just know who I can count on to get our KPIs met, is all."
    darius "Mhm. Don't come crying back to me when we hit Q4, you have deadlines, and everyone else is on vacation."
    player pout "（天哪……这些人在说什么啊？）"
    player "(KPIs... Q4... JIRA... what the heck are they {i}talking{/i} about?"
    goro angry "Between you two and Mala, [player_name] is going to think we run a barn instead of a dev shop!"
    goro smile "[player_name], this is Darius and Oliver."
    goro "Oliver here is our product owner - that basically means that he's in charge of running our project,"
    goro "making sure that we hit our deadlines, and discussing requirements for our projects so the customers are happy."
    oliver smile "It's a pleasure to meet you. I'm sure you'll do great here!"
    oliver laugh "You're even newer than Darius, and I bet you'll {i}still{/i} get more tickets done than him."
    darius smile "You think you're funny now, but when I bring pound cake to the office again, you can't have any."
    goro smile "Darius here is a junior - just like you!"
    darius "What's goin' on [player_name]? It's nice to have a fresh face around the office!"
    darius laugh "Being a junior will be way more fun when there's more than one of us!"
    darius "I've only got a year of experience myself, but I know my way around here."
    darius "So feel free to ask me if you need any help!"
    player smile "谢谢！"
    player "(Wow... I don't know exactly what I was expecting, but everyone here is so nice!)"
    player "（很高兴加入看起来很好的团队，但……）"
    player "(What {i}were{/i} all of those terms they were using earlier?)"
    goro "[player_name]?"
    player smile sweat "O-oh! Sorry - could you repeat what you asked?"
    goro "I was asking if you have any questions for me so far?"
    goro smile "I know that your first day of work can always be a little daunting."
    player surprised "嗯……"
    player sweat "Ah..."
    player smile "也不对！"
    goro "You don't?"
    player sweat smile "No! I'm good!"
    goro "Well... okay then! Like I said, I'm here if you need any help."
    player smile -sweat "谢谢！"

    scene bg bedroom with fadehold
    "Later that day..."
    show mint
    mint "喵！"
    player smile -sweat "Hi Mint! You'll never believe the day I just had. The office was huge!"
    player "I met tons of people, and everyone was really nice."
    player "They even gave me a company laptop and company cellphone! They're both the latest models. Talk about an upgrade!"
    player "……"
    mint "梦幻"
    player worry "Well... It's all super cool, but it's also a little overwhelming. All of the people I met today were nice, but there were so many of them."
    player "How am I supposed to remember all of their names?"
    player "And then I had to spend the rest of the day in meetings. Goro told me that I didn't have to do much but lend an ear, and even that was a lot."
    player "There were a million acronyms that I didn't know... I had no idea what anyone was talking about."
    player "Am I really cut out for this...?"
    mint "...?"
    mint "喵！"
    player smile "Hm... you're right! I can't give up yet. I worked too hard to get here."
    player "I know! I should give Annika a call. She told me to give her a ring when I finished my first day! Maybe I can ask her some questions?"
    hide mint

    show smartphone at truecenter
    play sound "<to 2.0>audio/sfx/phone_ring.wav"
    play sound "<to 2.0>audio/sfx/phone_dial_tone.wav"
    pause 2.0
    hide smartphone

    show annika
    pause 1.0
    annika @ laugh "[player_name]! How was your first day, superstar?"
    player smile "Great! Great... but also... like, really overwhelming?"
    annika "That sounds about right! That's about how my first day went, too. What happened?"
    "You explain all of the concerns that you told Mint about."
    annika "Wow, that's definitely a lot! I'm happy to answer any of your questions, though! What do you want to know specifically?"
    player neutral "嗯……"

    default first_day_story_choices = set()
    menu first_day_story_choices:
        set first_day_story_choices
        "Ask about acronyms":
            player "So as I said, I had to attend a few meetings today."
            player "It was so mind-boggling because, aside from not knowing what anyone was talking about,"
            player "There were so. Many. Acronyms!"
            player "What is PII? Or ETA? What on earth is PEBCAK?"
            annika laugh "Hehehe... that last one is actually pretty funny."
            player worry "Annika！"
            player pout "This isn't funny at all. I'm freaking out!"
            annika "Sorry, sorry!"
            annika "Things will be okay. The truth is, every industry has their own acronyms. Some companies even have their own acronyms."
            annika "So I could try to tell you what they all are, but I probably won't know them all."
            annika "The good news is, most companies are totally fine with you learning these things as you go!"
            player neutral "真的吗？"
            annika "Yup! Just make a habit out of asking about them."
            annika "What I do is keep a journal or a note-taking app open, and write down any acronyms I'm not familiar with."
            annika "Then, when we have a bit of free time, I ask my team lead or another developer what each one means."
            annika "Just a few at a time, though. You don't want to approach someone with 10 different acronyms to explain!"
            jump first_day_story_choices

        "Ask about Ruby on Rails":
            player "Okay... so I've always worked with programming languages like Python and JavaScript. But this company uses something called Ruby on Rails."
            player worry "I've never even worked with it before! Sometimes I wonder if I should have even been hired, because I don't know anything about it."
            annika @ neutral "That's totally fine!"
            annika "Ruby on Rails is a framework for the Ruby programming language."
            annika "A framework is more or less a collection of pre-written code that allows you to do things without writing everything from scratch yourself."
            annika "And it's okay that you don't know it! My company uses a Python framework called Django."
            annika "I didn't know Django at all before I came here, but I was given some assignments that helped catch me up to speed."
            annika "Another important thing to remember is that your company knows you don't know Ruby on Rails, right?"
            player neutral "Yeah... I made that very clear during my interviews."
            annika "See? It's not as if you lied to land the job! And let's take a look at your job description too - what does it say?"
            player "Hm..."
            player "Oh! How could I have missed this?"
            player "It says that I'll start off with just frontend work, and slowly be trained to assist with the backend."
            annika "See? That's perfect! Just be sure to spend time studying during and after work to really hone your skills."
            player "I'm... allowed to study?"
            player surprised "在工作？"
            annika "You sure are! You're in the big leagues now, my friend!"
            annika "You're not just being paid to develop - you're being paid to LEARN now too!"
            annika "Another good thing about your situation is that Ruby on Rails is super well documented. It's been around for 19 years."
            annika "That's ancient by programming standards! So you'll have lots of documentation online that can help you."
            player smile "And... if I get stuck, can I still give you a call now and again?"
            annika @ laugh "Are you kidding? Always! We're accountability buddies, right?"
            jump first_day_story_choices

        "What is JIRA?":
            player "So at work, they kept talking about JIRA... What is that?"
            annika 'Programming assignments are called "tickets".'
            annika "JIRA is just a ticketing management system! It keeps track of who's assigned to what tickets."
            player smile "哦明白了！"
            player "What does the acronym stand for?"
            annika "缩写？"
            player "JIRA is usually written in all capital letters. That means it's an acronym, right?"
            annika "No, no - that's just how it's written! The letters don't stand for anything."
            annika @ laugh "Fun Fact The name is actually a shorthand for “Gojira”, which is the Japanese translation of “Godzilla”!"
            player "Whoa, cool! I never would have guessed!"
            annika "You'll be doing tickets every day at work - once you sign in, you can get started immediately!"
            jump first_day_story_choices

        "Ask about getting stuck":
            player "Well, for starters... what if I get stuck? "
            annika "卡住了？"
            player "Sometimes, whenever I'm working on personal projects, I get stuck. That seems to be fine to do on personal projects,"
            player "but this is the real deal! Won't that make me look like I don't know how to do my job?"
            annika @ laugh "哈哈哈！"
            annika @ neutral "What do you do when you usually get stuck while you're working on a project?"
            player "Well... I look things up. And I double-check my code."
            player "I also see if I can find any developers that can help online."
            annika "See? You already know what to do!"
            annika "I know your team is all new to you, but you're a junior developer."
            annika "Their job is to help you whenever you're stuck. Not only can you ask them for help, but when you get assigned a task to fix some already existing code, you may even be able to speak to the person that originally wrote it!"
            player "Oh! Is it really that simple...?"
            annika "Yep! The cool part about doing this all professionally is that you're a part of a team now! They expect you to ask as many questions as you need to to get the job done."
            player "Wow - that really does make me feel better!"
            jump first_day_story_choices

        "I think that answers all my questions!":
            player relieved "(Sigh) I feel much, much better!"
            player smile "It looks like you've saved the day again, Annika."
            annika "Any time! Remember, you're a junior developer now - you've got a lot of hard work ahead of you,"
            annika "but you landing this job means that you were CHOSEN!"
            annika "This all seems like a lot, and like things are really overwhelming,"
            annika "but try to remember that your job isn't to learn all of these things in one day."
            annika "Worst case scenario, feel free to talk to your manager for a temperature check!"
            player "A temperature check?"
            annika "Yep! Every so often you can ask about how you're performing. You may even be able to ask for one-on-ones!"
            annika "They're meetings where you chat with your manager, say, once a week, or every other week, or even once a month." # Ed: Are temperature checks and one-on-ones the same thing? If so, we should probably just use one term
            annika "You can talk about your goals as a developer, receive feedback, or just use them as a chance to get to know your manager!"
            player "That actually sounds kind of nice!"
            annika "Don't forget - you're working with people, not a bunch of dragons that want to gobble you up!"
            "You finish up chatting with Annika, and feel a huge weight lifting off of your shoulders."
            "You get ready for bed, wanting to be as well-rested as possible for your first official day of work!"

    hide annika

    $ is_in_v2_arc1 = True
    $ work_session_questions = persistent.all_quiz_questions

label v2_days_before_demo:
    $ num_days = 0
    while num_days < 21:
        $ num_days += 1
        call day_start from _call_day_start_13
        call v2_routine from _call_v2_routine

    $ calendar.next_weekday()
    call day_start from _call_day_start_15
    call v2_demo from _call_v2_demo

label v2_days_after_demo:
    $ num_days = 0
    while num_days < 7:
        $ num_days += 1
        call day_start from _call_day_start_14
        call v2_routine from _call_v2_routine_1

    $ calendar.next_weekday()
    call day_start from _call_day_start_17
    call v2_redemption from _call_v2_redemption
    $ add_achievement(milestone_v2_redemption)

    call day_start from _call_day_start_18
    call v2_paying_it_forward_p1 from _call_v2_paying_it_forward_p1

label v2_arc1_devops:
    $ player_stats.subcategory_stats_map[DEVOPS] = 0
    $ quiz_session_questions = devops_questions
    $ num_days = 0
    while num_days < 3:
        $ num_days += 1
        call day_start from _call_day_start_16
        call v2_routine from _call_v2_routine_3

    $ calendar.next_weekday()
    call day_start from _call_day_start_19
    call v2_paying_it_forward_p2 from _call_v2_paying_it_forward_p2
    $ add_achievement(milestone_v2_arc1_complete)
    call screen text_over_black_bg_screen(_("You've reached the end of Arc I. Stay tuned for Arc II!"))

    # start v2 arc2
    $ is_in_v2_arc1 = False

    jump ending_splash