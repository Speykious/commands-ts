/*

Trying to think of a good Command Syntax System -> CSS
Let it work in the same way as shell commands.
('$' will be the prefix in those examples)
Examples:
$name arg1 arg2 arg3 --option1 oparg
$name
$name arg
$name --option1 --option2 oparg1 oparg2

Let's say:
- Arguments are always required
- Options are always optional
- The user has to have a set of permissions to be able to run the command



Arguments:
	{
		label: 'user'
		type: 'user'
		description: 'something to describe here'
	}
Options:
	{
		name: 'professeur'
		short: 'p'
		description: 'something to describe again'
		(arguments: null)
	}
	--professeur (-p)
	--squatteur (-s)
*/