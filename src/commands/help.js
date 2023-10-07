module.exports = {
    name: 'help',
    description: 'Displays a list of available commands or detailed information for a specific command.',
    execute(message, EmbedBuilder) {
     
        let messageToSend = `
        # Como usar o bot

        ## register
        
        \`.register\` ou \`.register nome\` ou \`.register "nome1 nome2"\`
        Exemplo: \`.register Rodrigo\` ou \`.register "O. Belo"\`
        
        ## add
        
        ### Adicionar uma tarefa:
        \`.add task "titulo" dd-mm-yyyy dd-mm-yyy completion_percentage (opctional)\`
        Exemplo: \`.add task "Caracterização das interfaces" 01-11-2023 05-11-2023 0\` 
        
        ### Associar uma tarefa a um grupo:
        \`.add task <task_id> to group <group_id>\`
        Exemplo: \`.add task 1 to group 1\`
        
        ### Associar uma tarefa a um ou mais elementos 
        \`.add task <task_id> to member <member_id>\` 
        Exemplos: \`.add task 1 to member 1\`
        
        ### Adicionar um grupo 
        \`.add group "Group name"\`
        Exemplo: \`.add group "Definição do Sistema"\`
        
        ## get 
        
        ### Obter as próprias tarefas por completar
        \`.get my tasks\`
        
        ### Obter as próprias tarefas completadas
        \`.get my completed tasks\`
        
        ### Outros métodos get
        \`.get tasks\`
        \`.get groups\`
        \`.get members\`
        
        \`.get task <task_id>\`, exemplo: \`.get task 2\`
        \`.get group <group_id>\`
        \`.get member <member_id>\`
        
        ## update
        
        ### Atualizar tarefas
        \`.update task <task_id> name "new name"\`
        \`.update task <task_id> beginDate dd-mm-yyyy\`
        \`.update task <task_id> endDate dd-mm-yyyy\`
        \`.update task <task_id> completion <número entre 0 e 100>\`
        \`.update task <task_id> members [member_list]\`
        \`.update task <task_id> group <group_id>\`
        
        `;
    
        message.channel.send(messageToSend);
    }
};
