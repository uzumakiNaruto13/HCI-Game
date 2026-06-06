# need to set npc and npc_sprite before calling these labels

label npc_conversation_start:
    $ renpy.show(npc_sprite) # Annika or Marco
    player smile "hello!"
    npc "嘿[player_name]！怎么了？"
    player "我学到了一些技术流行语想了解更多。"
    npc "当然，想知道什么？"

    $ label = None
    $ done_label = 'DONE'
    while label != done_label:
        $ choices = [(topic, ask_npc[topic]) for topic in topics_to_ask]
        $ choices.append((_("就这些"), done_label))
        $ label = renpy.display_menu(choices)
        if label != done_label:
            $ renpy.call(label=label)
            # no need to discard the asked topic here since it's discarded inside each label
            npc "还有别的吗？"

    player "就这些了，谢谢！"
    npc "没问题，晚安！"
    player "你也是！"
    play sound 'audio/sfx/phone_hangup.wav'
    $ renpy.hide(npc_sprite)

    if not plot_buzzword_ask in persistent.achievements:
        $ add_achievement(plot_buzzword_ask)

    return

label npc_choose_question:
    

label ask_hackathon:
    # use `discard` instead of `remove` to prevent the exception in case the player rolls back
    $ topics_to_ask.discard(_('Hackathon'))
    player "什么是黑客马拉松？"
    npc "是人们聚在一起设计和实现酷科技项目的活动。"
    npc "黑客马拉松通常不长，大多一两天。想象一下人们通宵在笔记本上编程的样子！"
    npc "人们通常组成小团队协作，特别是团队中有不同专长的人不仅是软件工程师还有平面设计师和产品经理。"
    npc "这是头脑风暴、原型设计和测试想法的好方式也许有一天会变成成熟产品。"
    player "听起来很酷！"
    npc "是啊！我只去过一两次但我公司有季度创新活动我很快会参加。"
    npc "你也该去些黑客马拉松！能学跟其他开发者甚至设计师协作。"
    npc "而且黑客马拉松项目在简历上很好看。"
    player "酷！但怎么找黑客马拉松活动？"
    npc "上网搜！你会惊讶附近有多少黑客马拉松。"
    player "太棒了！编程再好点就去看看。"

    # TODO: todo_list.add_todo('Try out hackathons'), needs more writing
    player "（嗯原来{b}黑客马拉松{/b}是这样的。）"
    $ todo_list.complete_todo(todo_ask_hackathon)
    player "已从待办划掉。"
    return

label ask_fullstack:
    $ topics_to_ask.discard(_('Full-Stack'))
    player "什么是全栈开发者？"
    npc "全栈开发者通常指全栈Web开发者，是能同时开发客户端和服务器软件的角色。"
    npc "你可能听过前端和后端了，全栈就是前端加后端。"
    npc "前端就是客户端软件或用户界面(UI)指应用的外观。"
    npc "比如网站的布局。"
    npc "后端就是服务器软件或逻辑，比如数据库如何记住你在购物网站的信息。"
    npc "再说一遍前端加后端就是全栈！"
    player "哇那全栈开发者真是万事通。"
    npc "没错！想了解更多可以看[freeCodeCamp]的课程！"
    player "我会的谢谢！"

    # TODO: add glossary
    player "（嗯原来{b}全栈{/b}是这样的。）"
    $ todo_list.complete_todo(todo_ask_fullstack)
    player "已从待办划掉。"
    return

label ask_machinelearning:
    $ topics_to_ask.discard(_('Machine Learning'))
    player "什么是机器学习？"
    npc "定义上机器学习是一种自动化分析模型构建的数据分析方法。"
    npc "基本目标是根据观察到的数据建立模型。"
    npc "模型可以是回归模型能给出估计值，比如根据位置和布局估算房价。"
    npc "模型也可以是分类比如区分猫和狗。"
    player "哇……"
    npc "我知道很神奇对吧？"
    npc "机器学习需要大量数学知识需要熟悉线性代数微积分等。"
    player "听起来很难但很酷！"
    npc "记住[freeCodeCamp]有机器学习入门资源。"
    npc "用机器学习可以做很多酷项目，比如{a=https://www.freecodecamp.org/news/discord-ai-chatbot/}一个像你最爱角色一样说话的聊天机器人{/a}？"
    player "听起来太棒了谢谢分享！"

    player "（嗯原来{b}机器学习{/b}是这样的。）"
    $ todo_list.complete_todo(todo_ask_machinelearning)
    player "已从待办划掉。"
    return

label ask_conference:
    $ topics_to_ask.discard(_('Conference'))
    player "什么是技术会议？"
    npc "技术会议是开发者聚集学习软件领域前沿进展的地方。"
    npc "通常有各自领域的专家做演讲。"
    npc "还可能有展位和演示环节让人展示想法和原型。"
    npc "有时有招聘会公司会招募参会者有兴趣记得带简历。"
    player "那些会议是关于什么的？科技听起来很广。"
    npc "会议通常有更具体的主题比如游戏开发者会议Web开发者会议或针对特定编程语言如Python或Java的会议。"
    player "听起来很有趣！"
    npc "对有些公司甚至赞助员工参加年度会议保持技能更新。"
    npc "有兴趣的话搜搜附近的会议吧！"
    player "一定！"

    player "（嗯原来技术{b}会议{/b}是这样的。）"
    $ todo_list.complete_todo(todo_ask_conference)
    player "已从待办划掉。"
    return

label ask_versioncontrol:
    $ topics_to_ask.discard(_('Version Control'))
    player "什么是版本控制？"
    player "（为什么要关心？）"
    npc "好问题让我告诉你什么是版本控制以及为什么要关心。"
    player "!"
    player "（呃……我脸上大概写满了关我什么事……）"
    npc "定义上版本控制是跟踪和管理软件代码变更的实践。"
    npc "版本控制系统是帮助软件团队管理源代码随时间变更的工具。"
    npc "例子包括Git这是最流行的现代版本控制系统。"
    npc "一些老牌公司可能还用较老的版本控制软件如Subversion(SVN)、Perforce等。"
    player "为什么要关心？"
    npc "版本控制能在发现bug时救你一命。"
    npc "比如新改动破坏了现有测试该怎么办？"
    npc "首先可以回退到测试通过的上一个工作版本然后从那里调试。"
    player "听起来很有用。"
    npc "版本控制确实很有用理解它能提高开发效率。"
    player "谢谢建议！"

    player "（嗯原来{b}版本控制{/b}是这样的。）"
    $ todo_list.complete_todo(todo_ask_versioncontrol)
    player "已从待办划掉。"
    return

label ask_devops:
    $ topics_to_ask.discard(_('DevOps'))
    player "什么是DevOps？"
    npc "定义上DevOps是文化理念、实践和工具的结合用于更好的软件交付。"
    npc "核心原则包括持续改进和自动化一切能自动化的。"
    player "哇自动化那条听起来很极端。"
    npc "如果能做到自动化能省大量时间和精力！"
    npc "DevOps是个大课题有兴趣的话强烈推荐上网阅读。"
    npc "记住它不只是一种职位更是一种思维方式。"
    player "好我自己研究谢谢。"

    player "（嗯原来{b}DevOps{/b}是这样的。）"
    $ todo_list.complete_todo(todo_ask_devops)
    player "已从待办划掉。"
    return

label ask_agile:
    $ topics_to_ask.discard(_('Agile'))
    player "什么是敏捷开发？"
    npc "定义可能无聊但如下：敏捷是一种迭代式的项目管理和软件开发方法。"
    npc "团队快速迭代频繁交付频繁反馈以构建更好的软件。"
    npc "软件需求、计划和结果被持续评估使团队有紧密反馈循环。"
    npc "有人说敏捷是方法论但对我来说更像一种思维。"
    player "快速失败经常失败？"
    npc "没错就是这样改进的。"
    player "哈哈能看出这种思维对终身学习有帮助太棒了。"

    player "（嗯原来{b}敏捷{/b}开发是这样的。）"
    $ todo_list.complete_todo(todo_ask_agile)
    player "已从待办划掉。"
    return

label ask_api:
    $ topics_to_ask.discard(_('API'))
    player "什么是API？"
    player "（为什么大家都用那些三字母缩略词？）"
    npc "API全称是应用程序编程接口。"
    npc "是一种软件中介允许两个应用互相通信或对接。"
    npc "比如天气组织提供天气报告的API。"
    npc "你可以建网站通过调用API显示天气报告。"
    npc "你手机内置天气应用也可能用同样的API作为数据源。"
    npc "所以一个天气API可以被任何人任何应用用来获取天气状态。"
    npc "对一个三字母缩略词来说API解释起来还挺费劲的对吧？"
    player "是啊……但我觉得大概明白了。"

    player "（嗯原来{b}API{/b}是这样的。）"
    $ todo_list.complete_todo(todo_ask_api)
    player "已从待办划掉。"
    return

label ask_userexperience:
    $ topics_to_ask.discard(_('User Experience'))
    player "什么是用户体验？"
    npc "想得比写代码还远啊？你可能有做产品经理的潜质！"
    player "（呃谢谢？）"
    npc "用户体验通常缩写为UX是用户如何与产品、系统或服务交互和体验的。"
    npc "包括人对实用性、易用性和效率的感知。"
    npc "我们可能会说网站用户体验差当它有糟糕的可用性或展示。"
    npc "比如新闻网站如果文章散落各处用户体验就差你找不到任何想看的东西。"
    npc "但别怕有用户体验设计来拯救。"
    npc "有经过时间考验的UX流程和模板旨在让应用干净清爽。"
    player "（嗯……我遇到过体验特别好或特别差的网站吗？）"
    npc "轮到我问了，你觉得[freeCodeCamp]的用户体验怎么样？"

    menu:
        "你觉得[freeCodeCamp]的用户体验如何？"
    
        "到目前为止不错！":
            npc "我也这么想浏览他们的网站做笔记也许能学到东西。"

        "需要改进！":
            npc "他们总是欢迎社区反馈所以一定要告诉他们！"

    player "会的！"

    player "（嗯原来{b}用户体验{/b}是这样的。）"
    $ todo_list.complete_todo(todo_ask_userexperience)
    player "已从待办划掉。"
    return
