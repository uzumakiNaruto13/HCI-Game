# events that happen when the player visits the cafe

label barista_fullstack:
    show woman red flipped at left
    show man blue at right
    female "我听说你升职了新职位？恭喜！"
    female "你现在做什么？"
    male "好了，我终于在做全栈开发了。记得我以前只做前端开发吗？那很快就变得无聊了……"
    player @ surprised "{b}全栈{/b}……那是什么？我最好记下来，以便了解更多。"
    $ todo_list.add_todo(todo_ask_fullstack)
    $ topics_to_ask.add(_('Full-Stack'))
    player @ smile "Added it to my To-Do list!"
    return    

label barista_devops:
    show boy blue flipped at left
    show man red at right
    college_boy "嘿，最近好吗？非常感谢你抽出时间来见我！"
    male "没问题。我总是很乐意指导大学生。"
    college_boy "哈哈谢谢。好的，我们开门见山吧。"
    college_boy "我对DevOps岗位很感兴趣，你有什么推荐的资源吗？"
    player @ surprised "{b}DevOps{/b}……那是什么？我最好记下来，以便了解更多。"
    $ todo_list.add_todo(todo_ask_devops)
    $ topics_to_ask.add(_('DevOps'))
    player @ smile "Added it to my To-Do list!"
    return

label barista_machinelearning:
    show girl orange flipped at left
    show boy purple at right
    college_girl "嘿嘿嘿，看看我们为课程项目做的这个酷东西！"
    college_girl "如果你给它看猫或狗的照片，它就能分辨出照片里是哪个！"
    # TODO: this could actually be a minigame or the player's side project :D
    college_boy "太酷了！你用机器学习做的吗？"
    college_girl "是啊！还有很多新技术我们可以加进去……"
    player @ surprised "{b}机器学习{/b}……那是什么？我最好记下来，以便了解更多。"
    $ todo_list.add_todo(todo_ask_machinelearning)
    $ topics_to_ask.add(_('Machine Learning'))
    player @ smile "Added it to my To-Do list!"
    return

label barista_conference:
    show woman blue flipped at left
    show girl blue at right
    college_girl "哦嘿，这不是我最喜欢的姐姐吗？"
    girl "……我是你唯一的姐姐。"
    college_girl "哦拜托！我只是想活跃一下气氛！"
    college_girl "你还在为参加会议紧张吗？"
    girl "……嗯，是的。我以前从未参加过……我不知道到了那里该做什么……"
    college_girl "你会没事的！会议很有趣！有讲座、海报展示，甚至还有招聘会！"
    girl "哦……听起来还不错。我能期待什么呢？"
    player @ surprised "一个技术{b}会议{/b}……听起来像是精英开发者去的地方。我最好记下来，以便了解更多。"
    $ todo_list.add_todo(todo_ask_conference)
    $ topics_to_ask.add(_('Conference'))
    player @ smile "Added it to my To-Do list!"
    return

label barista_agile:
    show man red flipped at left
    show woman purple at right
    male "所以你们团队要全面转向敏捷了？"
    female "是啊！有敏捷教练来提升我们的效率。"
    male "我们也有过教练。过渡到更现代软件开发方式的过程很顺利……"
    player @ surprised "{b}敏捷{/b}……那是什么？我最好记下来，以便了解更多。"
    $ todo_list.add_todo(todo_ask_agile)
    $ topics_to_ask.add('Agile')
    player @ smile "Added it to my To-Do list!"
    return

label barista_api:
    show girl purple flipped at left
    show boy red at right
    college_girl "这是这个项目的要求。"
    college_boy "哇。我们需要自己想出API？"
    college_girl "也许。或者我们可以在线搜索看看有没有可以用的公共API。"
    college_boy "听起来是个好主意！"
    college_girl "呵。了解你，任何能省你力气的事听起来都是好主意。"
    college_boy "哎哟。别这么刻薄。我这样做只是为了避免{bt}重复造轮子。{/bt}"
    college_girl "……好吧。随便你怎么说。我们开始工作吧。"
    player @ surprised "一个{b}API{/b}……那是什么？编程确实涉及很多缩写……"
    player "但有安妮卡帮我，这些东西没那么可怕了。我最好把它加到待办事项里，以后学习。"
    $ todo_list.add_todo(todo_ask_api)
    $ topics_to_ask.add(_('API'))
    player @ smile "Added it to my To-Do list!"
    return

label barista_userexperience:
    show woman red flipped at left
    show boy orange at right
    female "嘿你好。很高兴认识你！"
    female "你一定是我们新的用户体验实习生吧？"
    college_boy "是的！我很兴奋能加入团队！"
    female "好，好。现在跟我讲讲你自己。你为什么进入UX领域？做过哪些UX项目？"
    college_boy "当然！这一切都始于我学校的一个项目……"
    player @ surprised "{b}用户体验{/b}……那是什么？我最好记下来，以便了解更多。"
    $ todo_list.add_todo(todo_ask_userexperience)
    $ topics_to_ask.add(_('User Experience'))
    player @ smile "Added it to my To-Do list!"
    return

label barista_versioncontrol:
    show girl red flipped at left
    show boy blue at right
    girl "哦。天。哪。你刚刚炸毁了我们的代码库吗？"
    boy "哎呀。"
    girl "'哎呀'是你唯一能说的话？我们的项目截止日期是明天，你知道的！"
    boy "放松，好吗？我们有版本控制，不是吗？"
    girl "嗯。确实。"
    boy "那问题解决了。我们回滚就行。"
    boy "还要记得感谢最初建议我们设置版本控制的天才。"
    girl "……我不会因为你搞坏了代码而感谢你的，你知道。"
    player @ surprised "{b}版本控制{/b}……那是什么？我最好记下来，以便了解更多。"
    $ todo_list.add_todo(todo_ask_versioncontrol)
    $ topics_to_ask.add(_('Version Control'))
    player @ smile "Added it to my To-Do list!"
    return
