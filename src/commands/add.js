const Task = require('../schemas/Task.js');
const TaskGroup = require('../schemas/TaskGroup.js');
const TeamMember = require('../schemas/TeamMember.js');

module.exports = {
    name: "add",
    description: "Add a task or group to the database",
    async execute(message, args) {

        const discordId = message.author.id;
        let messageToSend = "";

        if (args.length < 2) {
            message.channel.send("Número insuficiente de argumentos.");
            return;
        }

        switch (args[0]) {
            case 'task':
                {
                    if (args.length < 4) {
                        message.channel.send("Número insuficiente de argumentos.");
                        return;
                    }

                    if (args[2] === "to" && args[3] === "group" && args.length >= 5) {

                        const groupNumber = parseInt(args[4]);
                        const group = await TaskGroup.findOne({groupId: groupNumber});
                        if (! group) {
                            message.channel.send(`O grupo ${groupNumber} não existe.`);
                            return;
                        }

                        const addedTasks = [];
                        const taskNumbers = (args[1] || '').match(/\d+/g)?.map(Number) || [];
                        
                        for (let i = 0; i < taskNumbers.length; i++) {
                            const task = await Task.findOne({taskId: taskNumbers[i]});

                            if (! task) {
                                messageToSend += `A tarefa ${
                                    taskNumbers[i]
                                } não existe.\n`;
                            } else {

                                if (group.tasks.includes(task._id)) {
                                    messageToSend += `A tarefa ${
                                        taskNumbers[i]
                                    } já está no grupo ${groupNumber}.\n`
                                    continue;
                                }

                                if (task.taskGroup) {
                                    const currentGroup = await TaskGroup.findOne({_id: task.taskGroup});
                                    if (currentGroup && currentGroup.groupId !== groupNumber) {
                                        currentGroup.tasks = currentGroup.tasks.filter(existingTask => !existingTask.equals(task._id));
                                        await currentGroup.save();

                                        messageToSend += `A tarefa ${
                                            task.taskId
                                        } foi removida do grupo ${
                                            currentGroup.groupId
                                        }.\n`;
                                    }
                                }

                                task.taskGroup = group._id;
                                group.tasks.push(task._id);
                                addedTasks.push(task.taskId);
                                await task.save();
                            }
                        }

                        await group.save();

                        if (addedTasks.length === 0) {
                            messageToSend += "Nenhuma tarefa adicionada ao grupo."
                        } else if (addedTasks.length === 1) {
                            messageToSend += `Tarefa ${
                                addedTasks[0]
                            } adicionada ao grupo ${groupNumber} com sucesso.`
                        } else {
                            const taskNumbersString = addedTasks.slice(0, -1).join(', ');
                            const lastTaskNumber = addedTasks.slice(-1)[0];
                            messageToSend += `Tarefas ${taskNumbersString} e ${lastTaskNumber} adicionadas ao grupo ${groupNumber} com sucesso.`
                        }

                        message.channel.send(messageToSend);
                        return;
                    } else if (args[2] == "to" && args[3] === "member" && args.length >= 5) {

                        const memberNumber = parseInt(args[4]);
                        const member = await TeamMember.findOne({memberId: memberNumber});
                        if (! member) {
                            message.channel.send(`O membro ${memberNumber} não existe.`);
                            return;
                        }

                        let addedTasks = [];
                        const taskNumbers = (args[1] || '').match(/\d+/g)?.map(Number) || [];

                        for (let i = 0; i < taskNumbers.length; i++) {
                            const task = await Task.findOne({taskId: taskNumbers[i]});

                            if (! task) {
                                messageToSend += `A tarefa ${
                                    taskNumbers[i]
                                } não existe.\n`;
                            } else {

                                if (task.assignedTeamMembers.includes(member._id)) {
                                    messageToSend += `O membro ${memberNumber} já está atribuído à tarefa ${
                                        taskNumbers[i]
                                    }.\n`;
                                    continue;
                                }

                                addedTasks.push(task.taskId);
                                task.assignedTeamMembers.push(member._id);
                                member.assignedTasks.push(task._id);
                                await task.save();
                            }
                        }

                        await member.save();

                        if (addedTasks.length === 0) {
                            messageToSend += "Nenhuma tarefa adicionada.";
                        } else if (addedTasks.length === 1) {
                            messageToSend += `Tarefa ${
                                addedTasks[0]
                            } adicionada ao membro ${memberNumber} com sucesso.`;
                        } else {
                            const taskNumbersString = addedTasks.slice(0, -1).join(', ');
                            const lastTaskNumber = addedTasks.slice(-1)[0];
                            messageToSend += `Tarefas ${taskNumbersString} e ${lastTaskNumber} adicionadas ao membro ${memberNumber} com sucesso.`;
                        }

                        message.channel.send(messageToSend);
                        return;

                    } else {
                        const taskName = args[1];
                        let taskBeginDate = null;
                        let taskEndDate = null;

                        try {
                            const date1 = args[2].split(/-|\//).map(Number);
                            const date2 = args[3].split(/-|\//).map(Number);
                            taskBeginDate = new Date(date1[2], date1[1] - 1, date1[0]);
                            taskEndDate = new Date(date2[2], date2[1] - 1, date2[0]);
                        } catch {
                            message.channel.send("Datas inválidas");
                            return;
                        }

                        if (taskBeginDate > taskEndDate) {
                            message.channel.send("Intervalo de datas inválido.");
                            return;
                        }
                    

                    const percentage = args[4] ? parseInt(args[4]) : 0;
                    const teamMembers = args[5] ? args[5].match(/\d+/g).map(Number) : [];
                    const group_id = args[6] ? args[6] : null;                

                    const task = new Task({name: taskName, beginDate: taskBeginDate, endDate: taskEndDate, completionPercentage: percentage})

                    for (let i = 0; i < teamMembers.length; i++) {
                        const teamMember = await TeamMember.findOne({memberId: teamMembers[i]});

                        if (! teamMember) {
                            messageToSend += `O membro ${
                                teamMembers[i]
                            } não existe.\n`;
                            continue;
                        } else {
                            task.assignedTeamMembers.push(teamMember._id);
                            teamMember.assignedTasks.push(task._id);
                            await teamMember.save();
                        }
                    }

                    if (group_id) {
                        const group = await TaskGroup.findOne({groupId: group_id});

                        if (! group) {
                            messageToSend += `O grupo ${
                                group_id
                            } não existe.\n`;
                        } else {
                            task.taskGroup = group._id;
                            group.tasks.push(task._id);
                            await group.save();
                        }
                    }

                    await task.save();
                    message.channel.send(messageToSend + `Tarefa ${
                        task.taskId
                    } adicionada com sucesso.`);
                }
                break;
            }
        case 'group':
            {
                const groupName = args[1];
                const tasks = args[2] ? args[2].match(/\d+/g).map(Number) : [];

                const taskGroup = new TaskGroup({name: groupName});

                for (let i = 0; i < tasks.length; i++) {
                    const task = await Task.findOne({taskId: tasks[i]});

                    if (! task) {
                        messageToSend += `A tarefa ${
                            tasks[i]
                        } não existe.\n`;
                        continue;
                    } else {
                        taskGroup.tasks.push(task._id);
                        task.taskGroup = taskGroup._id;
                        await task.save();
                    }
                }

                await taskGroup.save();
                message.channel.send(messageToSend + `Grupo ${
                    taskGroup.groupId
                } adicionado com sucesso.`);
                break;
            }
    }
}}
