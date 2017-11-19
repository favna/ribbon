const commando = require('discord.js-commando');

module.exports = class delRoleCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'delrole',
			'group': 'administration',
			'aliases': ['deleterole', 'dr', 'remrole', 'removerole'],
			'memberName': 'delrole',
			'description': 'Deletes a role from a member',
			'examples': ['delrole favna testrole1'],
			'guildOnly': true,
			'throttling': {
				'usages': 2,
				'duration': 10
			},

			'args': [
				{
					'key': 'member',
					'prompt': 'Who should get a role removed?',
					'type': 'member'
				},
				{
					'key': 'role',
					'prompt': 'What role should I remove?',
					'type': 'role'
				}
			]
		});
	}

	hasPermission (msg) {
		return msg.member.hasPermission('MANAGE_ROLES');
	}

	async run (msg, args) {
		await args.member.removeRole(args.role).then(() => msg.say(`\`${args.role.name}\` removed from \`${args.member.displayName}\``), () => msg.reply('Error'));
	}
};