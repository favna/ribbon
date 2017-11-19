const commando = require('discord.js-commando');

module.exports = class addRoleCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'addrole',
			'group': 'moderation',
			'aliases': ['newrole', 'ar'],
			'memberName': 'addrole',
			'description': 'Adds a role to a member',
			'examples': ['addrole favna testrole1'],
			'guildOnly': true,
			'throttling': {
				'usages': 2,
				'duration': 10
			},

			'args': [
				{
					'key': 'member',
					'prompt': 'To what member do you want to add the role?',
					'type': 'member'
				},
				{
					'key': 'role',
					'prompt': 'What role do you want to add?',
					'type': 'role'
				}
			]
		});
	}

	hasPermission (msg) {
		return msg.member.hasPermission('MANAGE_ROLES');
	}

	run (msg, args) {
		return args.member.addRole(args.role).then(() => msg.say(`\`${args.role.name}\` assigned to \`${args.member.displayName}\``), () => msg.reply('⚠️ An error occured!'));
	}
};