import * as React from 'react';
import Box from '@mui/material/Box';
import ultramin from 'prism-react-renderer/themes/ultramin';
import Grid from '@mui/material/Grid';
import {
    LiveProvider,
    LiveEditor,
  } from 'react-live';
import { transform } from './transform';
import exampleYaml from './example.yaml';

export function InlineConverter(props) {
    console.log(exampleYaml);
    const [code, setCode] = React.useState(exampleYaml);
    const [transformedCode, setTransformedCode] = React.useState('# Transformed YAML will appear here');
    return (
        <Grid container spacing={4}>
            <Grid item xs={6}>
                <h3> Input </h3>
                <Box sx={{ p: 2, border: '1px grey', backgroundColor: 'lightblue'}}>
                    <LiveProvider 
                        language="yaml" 
                        code={code}
                        noInline
                        transformCode= {
                            (code) => {
                                setCode(code);
                                setTransformedCode(transform(code));
                            }
                        }
                        theme={ultramin}
                    >
                        <LiveEditor style={{color: '#f8f8f2 !important'}} />
                    </LiveProvider>
                </Box>
            </Grid>
            <Grid item xs={6}>
                <h3> Output </h3>
                <Box sx={{ p: 2, border: '1px grey', backgroundColor: '#161b22'}}>
                    <LiveProvider 
                        language="yaml" 
                        code={transformedCode}
                        disabled={true}
                        noInline={true}
                    >
                        <LiveEditor />
                    </LiveProvider>
                </Box>
            </Grid>
        </Grid>
    );
}