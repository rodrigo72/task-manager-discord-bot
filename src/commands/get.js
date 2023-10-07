const Task = require('../schemas/Task.js');
const TaskGroup = require('../schemas/TaskGroup.js');
const TeamMember = require('../schemas/TeamMember.js');

const getAllTasks = async () => {
    try {
        const tasks = await Task.find().populate('assignedTeamMembers').populate('taskGroup');
        return tasks;
    } catch (error) {
        message.channel.send("Error fetching tasks.");
        console.error('Error fetching tasks:', error);
        return [];
    }
}

const getAllGroups = async () => {
    try {
        const groups = await TaskGroup.find().populate('tasks');
        return groups;
    } catch (error) {
        message.channel.send("Error fetching groups.");
        console.error('Error fetching groups:', error);
        return [];
    }
}

const getAllMembers = async () => {
    try {
        const members = await TeamMember.find().populate('assignedTasks');
        return members;
    } catch (error) {
        message.channel.send("Error fetching members.");
        console.error('Error fetching members:', error);
        return [];
    }
}

const generateTaskDescription = (task) => {
    let description = '';

    description += `Task ID: ${
        task.taskId
    }\n`;
    description += `Name: **${
        task.name
    }**\n`;
    description += `Begin Date: ${
        task.beginDate.toDateString()
    }\n`;
    description += `End Date: ${
        task.endDate.toDateString()
    }\n`;
    description += `Completion: ${
        task.completionPercentage || 'N/A'
    }%\n`;
    description += `Assigned Team Members: ${
        task.assignedTeamMembers.map(member => member.memberId).join(', ')
    }\n`;
    description += `Group: ${
        task.taskGroup ? task.taskGroup.groupId : 'None'
    }` + '\n\n';

    return description;
}

const fetchAndDisplay = async (message, type, idOrAll, getAllFunction, EmbedBuilder) => {

    const translationMap = new Map([
        [
            "member", "Membros"
        ],
        [
            "task", "Tarefas"
        ],
        [
            "group", "Grupos"
        ]
    ]);

    try {
        let entities;
        let title;

        if (idOrAll === 'all') {
            entities = await getAllFunction();
            title = `${
                translationMap.get(type)
            }`;
        } else {
            let model,
                populateField;

            switch (type) {
                case 'task': model = Task;
                    populateField = 'assignedTeamMembers taskGroup';
                    title = 'Tarefa';
                    break;
                case 'group': model = TaskGroup;
                    populateField = 'tasks';
                    title = 'Grupo';
                    break;
                case 'member': model = TeamMember;
                    populateField = 'assignedTasks';
                    title = 'Membro';
                    break;
                default:
                    message.channel.send('Tipo inválido.');
                    return;
            }

            const entity = await model.findOne({[`${type}Id`]: idOrAll}).populate(populateField);

            if (! entity) {
                message.channel.send(`O(a) ${
                    title.toLowerCase()
                } ${idOrAll} não existe.`);
                return;
            }

            entities = [entity];
        }

        if (entities.length === 0) {
            message.channel.send(`Não existem ${
                title.toLowerCase()
            }.`);
            return;
        }

        let description = '';
        entities.forEach(entity => {
            if (type === 'task') {
                description += generateTaskDescription(entity);
            } else if (type === 'group') {
                description += `**Group ID:** ${
                    entity.groupId
                }\n`;
                description += `**Name:** ${
                    entity.name
                }\n`;
                description += `Tasks: ${
                    entity.tasks.map(task => task.taskId).join(', ')
                }\n\n`;
            } else if (type === 'member') {
                description += `**Member ID:** ${
                    entity.memberId
                }\n`;
                description += `**Name:** ${
                    entity.name || 'N/A'
                }\n`;
                description += `Assigned Tasks: ${
                    entity.assignedTasks.map(task => task.taskId).join(', ')
                }\n\n`;
            }
        });

        message.channel.send({
            embeds: [new EmbedBuilder().setColor('#404574').setTitle(`${title}`).setDescription(description).setTimestamp()]
        });

    } catch (error) {
        console.error(`Error fetching ${type}s information:`, error);
        message.channel.send(`Erro ao procurar informações sobre ${
            translationMap.get(type)
        }.`);
    }
}

module.exports = {
    name: "get",
    description: "Get information from the database",
    async execute(message, args, EmbedBuilder) {

        if (args.length < 1) {
            message.channel.send("Número insuficiente de argumentos.");
            return;
        }

        switch (args[0]) {
            case "my":
                {
                    if (args[1] === "tasks" || args[2] === "tasks") {
                        try {

                            const discordId = message.author.id;

                            let teamMember = await TeamMember.findOne({discordId: discordId}).exec();
                            if (! teamMember) {
                                message.channel.send("Erro. Registo em falta.");
                                return;
                            }

                            const tasks = await Task.find({assignedTeamMembers: teamMember._id}).populate('assignedTeamMembers').populate('taskGroup').exec();

                            if (tasks.length === 0) {
                                message.channel.send("Não possui tarefas.");
                                return;
                            }

                            let description = ' ';
                            tasks.forEach(task => {

                                if ((args[1] === "tasks" && task.completionPercentage < 100) || (args[1] === "completed" && task.completionPercentage == 100)) {
                                    description += generateTaskDescription(task);
                                }

                            });

                            message.channel.send({
                                embeds: [new EmbedBuilder().setColor('#404574').setTitle(`Tarefas - ${
                                        teamMember.name
                                    }`).setDescription(description).setTimestamp()]
                            });

                        } catch (error) {
                            console.error('Error fetching tasks:', error);
                            message.channel.send("Erro ao procurar tarefas.");
                        }
                    } else {
                        message.channel.send("Comando inválido.");
                    }
                    break;
                }
            case "tasks":
                {
                    fetchAndDisplay(message, 'task', 'all', getAllTasks, EmbedBuilder);
                    break;
                }
            case "groups":
                {
                    fetchAndDisplay(message, 'group', 'all', getAllGroups, EmbedBuilder);
                    break;
                }
            case "members":
                {
                    fetchAndDisplay(message, 'member', 'all', getAllMembers, EmbedBuilder);
                    break;
                }
            case "task":
                {
                    if (args.length < 2) {
                        message.channel.send("Número insuficiente de argumentos.");
                        return;
                    }
                    let taskId = null;
                    try {
                        taskId = parseInt(args[1]);
                        fetchAndDisplay(message, 'task', taskId, null, EmbedBuilder);
                    } catch (error) {
                        message.channel.send("ID inválido.");
                        return;
                    }
                    break;
                }
            case "group":
                {
                    if (args.length < 2) {
                        message.channel.send("Número insuficiente de argumentos.");
                        return;
                    }

                    if (args.length > 2 && args[2] === "tasks") {

                        const taskGroup = await TaskGroup.findOne({groupId: args[1]}).populate('tasks');

                        if (! taskGroup) {
                            message.channel.send(`O grupo ${
                                args[1]
                            } não existe.`);
                            return;
                        }

                        let description = ' ';

                        for (const task_object_id of taskGroup.tasks) {
                            const task = await Task.findOne({_id: task_object_id}).populate('assignedTeamMembers').populate('taskGroup');

                            if (! task) {
                                continue;
                            }

                            description += generateTaskDescription(task);
                        }

                        message.channel.send({
                            embeds: [new EmbedBuilder().setColor('#404574').setTitle(`Tarefas - Grupo ${
                                    args[1]
                                }`).setDescription(description).setTimestamp()]
                        });

                    } else {
                        let groupId = null;
                        try {
                            groupId = parseInt(args[1]);
                            fetchAndDisplay(message, 'group', groupId, null, EmbedBuilder);
                        } catch (error) {
                            message.channel.send("ID inválido.");
                            return;
                        }
                    }


                    break;
                }
            case "member":
                {
                    if (args.length < 2) {
                        message.channel.send("Número insuficiente de argumentos.");
                        return;
                    }

                    let memberId = null;
                    try {
                        memberId = parseInt(args[1]);
                        fetchAndDisplay(message, 'member', memberId, null, EmbedBuilder);
                    } catch (error) {
                        message.channel.send("ID inválido.");
                        return;
                    }
                    break;
                }
        }
    }
}
