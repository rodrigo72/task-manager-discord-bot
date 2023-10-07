const Task = require('../schemas/Task.js');
const TaskGroup = require('../schemas/TaskGroup.js');
const TeamMember = require('../schemas/TeamMember.js');
const roles = require('../config/roles.js');

const deleteAll = (message, model, filter, successMessage, errorMessage) => {
    model.deleteMany(filter).then((result) => {
        console.log(`${
            result.deletedCount
        } documents deleted.`);
        if (successMessage) {
            message.channel.send(successMessage);
        }
    }).catch((error) => {
        console.error("Error deleting documents: ", error);
        if (errorMessage) {
            message.channel.send(errorMessage);
        }
    });
};

module.exports = {
    name: "delete",
    description: "Delete a task, group or team member to the database",
    async execute(message, args) {

        if (args.length < 2) {
            message.channel.send("Número insuficiente de argumentos.");
            return;
        }

        const member = await TeamMember.findOne({discordId: message.author.id}).exec();
        if (! member) {
            message.channel.send("Membro não encontrado.");
            return false;
        }

        switch (args[0]) {
            case "task":
                {
                    if (member.roles.Admin == roles.Admin || member.roles.Manager == roles.Manager) {

                        const deletedTasks = [];
                        const taskNumbers = args[1].match(/\d+/g).map(Number);
                        for (let i = 0; i < taskNumbers.length; i++) {
                            const task = await Task.findOne({taskId: taskNumbers[i]});
                            if (! task) {
                                message.channel.send(`A tarefa ${
                                    taskNumbers[i]
                                } não existe.`);
                                return;
                            }

                            TeamMember.updateMany({
                                assignedTasks: task._id
                            }, {
                                $pull: {
                                    assignedTasks: task._id
                                }
                            }).catch((error) => {
                                message.channel.send("Erro ao atualizar membros.");
                                console.error("Error updating members: ", error);
                            });

                            TaskGroup.updateMany({
                                tasks: task._id
                            }, {
                                $pull: {
                                    tasks: task._id
                                }
                            }).catch((error) => {
                                message.channel.send("Erro ao atualizar grupos.");
                                console.error("Error updating groups: ", error);
                            });

                            const deleteTask = await Task.deleteOne({taskId: taskNumbers[i]});
                            if (deleteTask.deletedCount === 0) 
                                message.channel.send(`Erro ao apagar a tarefa ${
                                    taskNumbers[i]
                                }.`);
                             else 
                                deletedTasks.push(taskNumbers[i]);
                            

                        }

                        if (deletedTasks.length === 1) {
                            message.channel.send(`A tarefa ${
                                deletedTasks[0]
                            } foi apagada com sucesso.`);
                        } else if (deletedTasks.length > 1) {
                            const taskNumbersString = deletedTasks.slice(0, -1).join(', ');
                            const lastTaskNumber = deletedTasks.slice(-1)[0];
                            message.channel.send(`As tarefas ${taskNumbersString} e ${lastTaskNumber} foram apagadas com sucesso.`);
                        }
                    } else {
                        message.channel.send("Permissões insuficientes.");
                    }
                    break;
                }
            case "group":
                {
                    if (member.roles.Admin == roles.Admin || member.roles.Manager == roles.Manager) {

                        const member = await TeamMember.findOne({discordId: message.author.id}).exec();
                        if (! member) {
                            message.channel.send("Membro não encontrado.");
                            return;
                        }

                        const deletedGroups = [];
                        const groupNumbers = args[1].match(/\d+/g).map(Number);

                        for (let i = 0; i < groupNumbers.length; i++) {
                            const group = await TaskGroup.findOne({groupId: groupNumbers[i]});
                            if (! group) {
                                message.channel.send(`O grupo ${
                                    groupNumbers[i]
                                } não existe.`);
                                return;
                            }

                            let result = null;
                            if (args[2] && args[2] == "&tasks") {
                                result = await Task.deleteMany({taskGroup: group._id});
                                message.channel.send(`${
                                    result.deletedCount
                                } tarefas apagadas.`);
                            } else {
                                result = await Task.updateMany({
                                    taskGroup: group._id
                                }, {taskGroup: null});
                            }

                            const deletedGroup = await TaskGroup.deleteOne({groupId: groupNumbers[i]});
                            if (deletedGroup.deletedCount === 0) 
                                message.channel.send(`Erro ao apagar o grupo ${
                                    groupNumbers[i]
                                }.`);
                             else 
                                deletedGroups.push(groupNumbers[i]);
                            

                        }

                        if (deletedGroups.length === 1) {
                            message.channel.send(`O grupo ${
                                deletedGroups[0]
                            } foi apagado com sucesso.`);
                        } else if (deletedGroups.length > 1) {
                            const groupNumbersString = deletedGroups.slice(0, -1).join(', ');
                            const lastGroupNumber = deletedGroups.slice(-1)[0];
                            message.channel.send(`Os grupos ${groupNumbersString} e ${lastGroupNumber} foram apagados com sucesso.`);
                        }
                    } else {
                        message.channel.send("Permissões insuficientes.");
                    }
                    break;
                }
            case "member":
                {
                    try {
                        if (member.roles.Admin == roles.Admin) {

                            const deletedMembers = [];
                            const memberNumbers = args[1].match(/\d+/g).map(Number);

                            for (let i = 0; i < memberNumbers.length; i++) {

                                const teamMember = await TeamMember.findOne({memberId: memberNumbers[i]});
                                if (! teamMember) {
                                    message.channel.send(`O membro ${
                                        memberNumbers[i]
                                    } não existe.`);
                                    continue;
                                }

                                let result = await Task.updateMany({
                                    assignedTeamMembers: teamMember._id
                                }, {
                                    $pull: {
                                        assignedTeamMembers: teamMember._id
                                    }
                                });

                                console.log(`${
                                    result.nModified
                                } tasks updated to remove the member.`);

                                result = await TeamMember.deleteOne({memberId: memberNumbers[i]});
                                if (result.deletedCount === 0) 
                                    message.channel.send("Erro ao apagar membro.");
                                 else 
                                    deletedMembers.push(memberNumbers[i]);
                                

                            }

                            if (deletedMembers.length === 1) {
                                message.channel.send(`O membro ${
                                    deletedMembers[0]
                                } foi apagado com sucesso.`);
                            } else if (deletedMembers.length > 1) {
                                const memberNumbersString = deletedMembers.slice(0, -1).join(', ');
                                const lastMemberNumber = deletedMembers.slice(-1)[0];
                                message.channel.send(`Os membros ${memberNumbersString} e ${lastMemberNumber} foram apagados com sucesso.`);
                            }
                        } else {
                            message.channel.send("Permissões insuficientes.");
                        }
                        break;
                    } catch (error) {
                        console.error("Error updating tasks: ", error);
                    }
                }
        }
    }
}
