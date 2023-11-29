// material-ui
import { Button } from '@mui/material';

// third-party
import { enqueueSnackbar, useSnackbar } from 'notistack';

// project import
import SubCard from 'ui-component/cards/SubCard';

// ==============================|| NOTISTACK - ACTION BUTTONS ||============================== //

export default function SnackBarAction() {
    const { closeSnackbar } = useSnackbar();
    const actionTask = (snackbarId) => (
        <>
            <Button
                variant="text"
                onClick={() => {
                    // eslint-disable-next-line
                    alert(`I belong to snackbar with id ${snackbarId}`);
                }}
            >
                Undo
            </Button>
            <Button variant="text" onClick={() => closeSnackbar(snackbarId)}>
                Dismiss
            </Button>
        </>
    );

    return (
        <SubCard title="With Action">
            <Button
                variant="contained"
                fullWidth
                sx={{ marginBlockStart: 2 }}
                onClick={() => enqueueSnackbar('Your notification here', { action: (key) => actionTask(key) })}
            >
                Show Snackbar
            </Button>
        </SubCard>
    );
}
