import * as React from 'react';
import { Avatar, Box } from '@mui/joy';
import Typography from '@mui/joy/Typography';

export default function HeaderSection() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        top: 0,
        px: 1.5,
        py: 1,
        zIndex: 10000,
        backgroundColor: 'background.body',
        borderBottom: '1px solid',
        borderColor: 'divider',
        position: 'sticky',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
	  	<Avatar
			src="/iitk_logo.jpg"
	  	/>
        <Typography component="h1" fontWeight="xl">
	  		Assamese Speech Processing
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 3 }}>
        <Box
          sx={{
            gap: 1,
            alignItems: 'center',
            display: { xs: 'none', sm: 'flex' },
          }}
        >
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography level="title-sm">Punyabrat</Typography>
            <Typography level="body-xs">punya@chutiya.com</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
