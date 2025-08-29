import { useRouter } from 'next/router';
import { Container, Box, Typography, Button } from '@mui/material';

export default function Home() {
  const router = useRouter();

  const handleLoginRedirect = () => {
    router.push('/login');
  };

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <Typography component="h1" variant="h2" gutterBottom>
          Welcome to NCD-CMU
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Your central hub for managing NCD data and patient information in Chiang Mai University.
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={handleLoginRedirect}
          sx={{ mt: 4 }}
        >
          Go to Login
        </Button>
      </Box>
    </Container>
  );
}

export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/login',
      permanent: false,
    },
  };
}
