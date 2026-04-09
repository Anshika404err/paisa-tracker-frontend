import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import LightModeIcon from '@mui/icons-material/LightMode';

const theme = createTheme({
  palette: {
    purple: {
      main: '#8656cd',
      light: '#E9DB5D',
      dark: '#A29415',
      contrastText: '#242105',
    },
  },
});

function ResponsiveAppBar({ thememode, toggle, setUser, user, setFlag, flag }) {
  const navigate = useNavigate();
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [navuser, setNavuser] = useState({});

  // ------------ hook to handle the user details ------------------ 
  useEffect(() => {
    const check = async () => {
      try {
        const loggedInUser = localStorage.getItem("user");
        if (loggedInUser) {
          const foundUser = JSON.parse(loggedInUser);
          setNavuser(foundUser);
          await setUser(foundUser);
        }
      } catch (err) {
        console.error(err);
      }
    };
    check();
  }, [user?._id, flag, setUser]); // Added setUser to dependencies

  // ------------- function to logout ----------------------- 
  function Logout() {
    localStorage.clear();
    navigate('/login');
  }

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <AppBar position="static" color="transparent" sx={{ boxShadow: 'none', elevation: 0 }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* Added alt prop for accessibility */}
            <img src="favicon.ico" alt="Paisa Vasooli Logo" style={{ height: "50px" }} />
            
            <Typography
              variant="h6"
              noWrap
              component="a"
              onClick={() => { navigate("/dashboard") }}
              sx={{
                mr: 2,
                display: { xs: 'none', md: 'flex' },
                fontFamily: 'poppins',
                fontWeight: 700,
                letterSpacing: '.1rem',
                color: thememode === 'dark' ? 'white' : '#000080',
                cursor: 'pointer',
                textDecoration: 'none',
              }}
            >
              Paisa Vasooli
            </Typography>

            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
              {['Dues', 'Groups', 'Savings', 'Charts', 'Stocks'].map((page) => (
                <Button
                  key={page}
                  onClick={() => { navigate(`/${page.toLowerCase()}`) }}
                  sx={{
                    my: 2,
                    color: thememode === 'dark' ? 'white' : '#000080',
                    display: 'block',
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      width: '100%',
                      height: '2px',
                      backgroundColor: thememode === 'dark' ? 'white' : '#000080',
                      bottom: '-2px',
                      left: 0,
                      transform: 'scaleX(0)',
                      transformOrigin: 'bottom right',
                      transition: 'transform 0.25s ease-out',
                    },
                    '&:hover::after': {
                      transform: 'scaleX(1)',
                      transformOrigin: 'bottom left',
                    },
                  }}
                >
                  {page}
                </Button>
              ))}
            </Box>

            <Box sx={{ flexGrow: 0 }}>
              <LightModeIcon
                onClick={toggle}
                sx={{
                  color: thememode === 'dark' ? 'white' : 'inherit',
                  cursor: 'pointer',
                  verticalAlign: 'middle'
                }}
              />
              <MailOutlineIcon
                sx={{
                  mx: 2,
                  color: thememode === 'dark' ? 'white' : 'inherit',
                  cursor: 'pointer',
                  verticalAlign: 'middle'
                }}
                onClick={() => { navigate("/inbox") }}
              />
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt={navuser?.name || "User"} src={navuser?.image || 'ProfileImg.jpeg'} />
              </IconButton>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                <MenuItem key="Profile" onClick={() => { navigate("/profile"); handleCloseUserMenu(); }}>
                  <Typography textAlign="center">Profile</Typography>
                </MenuItem>
                <MenuItem key="Vault" onClick={() => { navigate("/vault"); handleCloseUserMenu(); }}>
                  <Typography textAlign="center">Vault</Typography>
                </MenuItem>
                <MenuItem key="Logout" onClick={Logout}>
                  <Typography textAlign="center">Logout</Typography>
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </ThemeProvider>
  );
}

export default ResponsiveAppBar;