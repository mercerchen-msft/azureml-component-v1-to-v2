const yaml = require('yaml');

export function transform(code) {
    try {
        let data = yaml.parseDocument(code);
        let distributed_type = 'mpi';

        if (data == null) return 'Error:\nYaml parser failed to parse the yaml input\nYour input is likely invalid.';
        // schema
        if (data.has('$schema')) {
            data.delete('$schema');
        }

        // code
        if (data.has('code')) {
            yaml.visit(data, {
                Pair(_, pair) {
                    if (pair.key && pair.key.value === 'code') pair.key.commentBefore = "# TODO: Configure your code";
                },
            });
        }
        else {
            let key = new yaml.Scalar('code');
            key.spaceBefore = true;
            key.commentBefore = "# TODO: Configure your code"
            let item = new yaml.Scalar('.')
            item.type = "PLAIN"
            data.set(key, item);
        }

        // launcher/command
        if (data.has('launcher')) {
            let command = data.getIn(['launcher', 'additional_arguments']);
            distributed_type = data.getIn(['launcher', 'type']);
            command = processCommand(command);
            yaml.visit(data, {
                Pair(_, pair) {
                    if (pair.key && pair.key.value === 'launcher') {
                        let key = new yaml.Scalar('command');
                        key.spaceBefore = true;
                        return new yaml.Pair(key, command);
                    }
                },
            });
        } else if (data.has('command')) {
            let command = data.getIn(['command']);
            command = processCommand(command);
            data.set('command', command);
        } else {
            return 'Error: You need to have either launcher or command in your yaml file.';
        }

        // type
        if (data.has('type')) {
            let type = data.get('type');
            if (type == 'DistributedComponent') {
                let key = new yaml.Scalar('distribution');
                key.spaceBefore = true;
                let items = new yaml.YAMLMap([]);
                let distributed_type_scalar = new yaml.Scalar(distributed_type);
                distributed_type_scalar.type = "PLAIN";
                items.add(new yaml.Pair('type', distributed_type_scalar));
                items.add(new yaml.Pair('process_count_per_instance', new yaml.Scalar(8)));
                data.set(key, items);
            }
            data.set('type', 'command');
        }

        // environment
        if (data.has('environment')) {
            yaml.visit(data, {
                Pair(_, pair) {
                    if (pair.key && pair.key.value === 'environment') pair.key.commentBefore = "# TODO: Configure your environment";
                },
            });
        }
        // inputs/outputs
        if (data.has('inputs') || data.has('outputs')) {
            yaml.visit(data, {
                Pair(_, pair) {
                    if (pair.key && pair.key.value === 'description') {
                        pair.value.type = 'BLOCK_FOLDED';
                    }
                    if (pair.key && pair.key.value === 'type') {
                        if (pair.value == 'int') {
                            pair.value = new yaml.Scalar('integer');
                        }
                        else if (pair.value == 'float') {
                            pair.value = new yaml.Scalar('number');
                        }
                        else if (pair.value == 'enum') {
                            pair.value = new yaml.Scalar('string');
                        }
                        pair.value.type = 'PLAIN';
                    };
                },
            });
        }
        return yaml.stringify(data, { defaultStringType: 'BLOCK_LITERAL', defaultKeyType: 'PLAIN', doubleQuotedMinMultiLineLength: 0 });
    } catch (e) {
        console.log(e);
        return `${e}`;
    };
}

function processCommand(command){
    return command.replaceAll("[", "$[[").replaceAll("]", "]]").replaceAll("{", "${{").replaceAll("}", "}}");
}
