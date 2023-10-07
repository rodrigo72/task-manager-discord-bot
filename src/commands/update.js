const Task = require('../schemas/Task.js');
const TaskGroup = require('../schemas/TaskGroup.js');
const TeamMember = require('../schemas/TeamMember.js');
const roles = require('../config/roles.js');

module.exports = {
    name: "update",
    description: "Update a task, member or group from the database",
    async execute(message, args) {

        if (args.length < 3) {
            message.channel.send("Invalid number of arguments.");
            return;
        }

        let messageToSend = "";

        switch (args[0]) {
            case "task":
                {
                    const taskId = args[1];
                    const task = await Task.findOne({taskId});

                    if (! task) {
                        message.channel.send(`Tarefa ${taskId} não econtrada.`);
                        return;
                    }

                    switch (args[2]) {
                        case "name":
                            {
                                const name = args[3];
                                task.name = name;
                                await task.save();
                                message.channel.send(`Nome da tarefa ${taskId} atualizado para "${name}".`);
                                break;
                            }
                        case "beginDate":
                            {
                                try {
                                    const date = args[3].split(/-|\//).map(Number);
                                    task.beginDate = new Date(date[2], date[1] - 1, date[0]);
                                    await task.save();
                                    message.channel.send(`Data de início da tarefa ${taskId} atualizada para ${
                                        task.beginDate.toLocaleDateString()
                                    }.`);
                                } catch (error) {
                                    message.channel.send("Data inválida.");
                                }
                                break;
                            }
                        case "endDate":
                            {
                                try {
                                    const date = args[3].split(/-|\//).map(Number);
                                    task.endDate = new Date(date[2], date[1] - 1, date[0]);
                                    await task.save();
                                    message.channel.send(`Data de fim da tarefa ${taskId} atualizada para ${
                                        task.endDate.toLocaleDateString()
                                    }.`);
                                } catch (error) {
                                    message.channel.send("Data inválida.");
                                }
                                break;
                            }
                        case "completion":
                            {
                                const completionPercentage = Number(args[3]);
                                task.completionPercentage = completionPercentage;
                                await task.save();
                                message.channel.send(`Percentagem de conclusão da tarefa ${taskId} atualizada para ${completionPercentage}%.`);
                                break;
                            }
                        case "members":
                            {

                                const new_members = (args[3] || '').match(/\d+/g) ?. map(Number) || [];

                                for (const member_object_id of task.assignedTeamMembers) {
                                    const member = await TeamMember.findOne({_id: member_object_id});

                                    if (! member) 
                                        continue;
                                    
                                    if (! new_members.includes(member.memberId)) {
                                        member.assignedTasks = member.assignedTasks.filter(task_object_id => task_object_id !== task._id);
                                    } else {
                                        new_members.splice(new_members.indexOf(member.memberId), 1);
                                    }

                                    await member.save();
                                }

                                for (const member_id of new_members) {
                                    const member = await TeamMember.findOne({memberId: member_id});

                                    if (! member) 
                                        continue;
                                    
                                    member.assignedTasks.push(task._id);
                                    await member.save();
                                    task.assignedTeamMembers.push(member._id);
                                }

                                await task.save();
                                message.channel.send(`Membros da tarefa atualizados.`);
                                break;
                            }
                        case "group":
                            {
                                const group_id = Number(args[3]);
                                const new_group = await TaskGroup.findOne({groupId: group_id});

                                if (! new_group) {
                                    message.channel.send(`Grupo ${group_id} não encontrado.`);
                                    return;
                                }

                                console.log(new_group.groupId);

                                const previous_group_id = task.taskGroup;
                                const previous_group = await TaskGroup.findOne({ _id: previous_group_id });
                                console.log(previous_group.groupId);

                                if (!new_group) {
                                    message.channel.send(`Grupo ${group_id} não encontrado.`);
                                    return;
                                }

                                if (!previous_group) {
                                    task.taskGroup = new_group._id;
                                    await task.save();
                                    new_group.tasks.push(task._id);
                                    await new_group.save();   

                                    message.channel.send(`Tarefa ${taskId} adicionada ao grupo ${group_id}.`);
                                } else if (previous_group.groupId !== group_id) {
                                    task.taskGroup = new_group._id;
                                    await task.save();
                                    new_group.tasks.push(task._id);
                                    await new_group.save();  

                                    previous_group.tasks = previous_group.tasks.filter(task_object_id => task_object_id.toString() !== task._id.toString());
                                    await previous_group.save();
                                    message.channel.send(`Tarefa ${taskId} movida do grupo ${previous_group.groupId} para o grupo ${group_id}.`);
                                } else {
                                    message.channel.send(`Tarefa ${taskId} já está no grupo ${group_id}.`);
                                    return;
                                }

                                break;
                            }
                    }
                    break;
                }
            case "group":
                {
                    message.channel.send("Por implementar.");
                    break;
                }
            case "member":
                {
                    message.channel.send("Por implementar.");
                    break;
                }
        }

    }
}
