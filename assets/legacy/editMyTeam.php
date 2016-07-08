<?php session_start(); ?>
<!DOCTYPE HTML>
<html>
<head>
    <title>Fantasy Impromptu - My Team</title>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <link href="style.css" rel="stylesheet" type="text/css">
    <script src="lib/jquery-1.11.0.min.js"></script>
    <script language='JavaScript'  type="text/javascript">
        $(document).ready(function(){ validateCheckBoxes(null); }) 
    
        function validateCheckBoxes(box)
        {
           
            var countriesInPool = new Array();
            countriesInPool[0] = 0;
            countriesInPool[1] = 0;
            countriesInPool[2] = 0;
            countriesInPool[3] = 0;
            
            for(i=0; i<document.countriesCheckBoxes.length; ++i) 
            {
                var pool = Math.floor(i/8);
                
                if (document.countriesCheckBoxes[i].checked)
                    countriesInPool[pool]++;                
            } 
            
            if (box != null) {
                if (countriesInPool[0] > 2 || countriesInPool[1] > 2 || countriesInPool[2] > 2 || countriesInPool[3] > 2)
                    box.checked=false;
                else 
                    jQuery(box.parentNode.parentNode).toggleClass("active");
            }
                
            for (j=0; j<4; ++j) {
                if (countriesInPool[j] >= 2)
                    $('.country_column:nth-of-type(' + (j+1) + ')').addClass('inactive');
                else
                    $('.country_column:nth-of-type(' + (j+1) + ')').removeClass('inactive');
            }
        }
    </script>
</head>
<body>

<?php
    include ("navigation.php");
    include ("sidebar.php");

    echo '<div class="main">';
    
    $dbh = new mysqli("localhost","fantasy_fantasy","IloveAllan", "fantasy_olympics");
    if (!$dbh) die('Could not connect: ' . mysql_error());

    if (!isset($_SESSION['team_name']))
        echo "<h2>Step 2 of 2</h2>";
    
    if (time() > 1402606800)
    {
        // World cup has started. Disallow further edits.
        echo "The world cup has started. You may no longer edit your team.";
    }
    else if (!isset($_POST["submitMyTeam"]))
    {
        if (!isset($_SESSION['logged_in']))
            // user has navigated here at the wrong time, using a stored URL
            echo "<br/>Please log in using the form on the sidebar.";
        else
            showFormWithCurrentValues($dbh);
    }
    else
    {
        // Validate the values put on the form by the user.  
        $oldTeamName = isset($_SESSION['team_name']) ? $_SESSION['team_name'] : '';
        $teamName  = isset($_POST['team_name'])  ? trim($_POST['team_name'])  : '';
        $countries = isset($_POST['countries'])  ? $_POST['countries']  : '';

        $errorTeamName = validateTeamName($dbh, $teamName, $oldTeamName);
        // This probably isn't necessary with the javascript in place,
        // but will call it anyway to be sure.
        $errorCountries = validateCountriesOnTeam($dbh, $countries);

        if ($errorTeamName || $errorCountries)
        {
            showForm($dbh, $teamName, isset($_POST['countries']) ? $_POST['countries'] : (array)null, $errorTeamName, $errorCountries);
        }
        else
        {
            removeRecordsFromCountriesOnTeamsTable($dbh, $oldTeamName);
            removeRecordFromTeamStandingsTable($dbh, $oldTeamName);
            updateTeamNameOnUsersTable($dbh, $_SESSION['email'], $teamName);
            addRecordToCountriesOnTeamsTable($dbh, $teamName, $countries);
            updateStandings($dbh);
            $_SESSION['team_name'] = $teamName;
            echo '<script>window.location="edited.php";</script>';
        }
    }
    
    $dbh->close();
?>

<?php // Functions for persisting data   
    function updateTeamNameOnUsersTable($dbh, $email, $teamName)
    {
        $fn = $dbh->prepare("UPDATE users SET team = ? WHERE email = ?");
        $fn->bind_param('ss', $teamName, $email);
        $fn->execute();
    }

    function removeRecordsFromCountriesOnTeamsTable($dbh, $teamName)
    {
        $fn = $dbh->prepare("DELETE FROM countries_on_teams WHERE team = ?");
        $fn->bind_param('s', $teamName);
        $fn->execute();    
    }

    function removeRecordFromTeamStandingsTable($dbh, $teamName)
    {
        $fn = $dbh->prepare("DELETE FROM team_standings WHERE team = ?");
        $fn->bind_param('s', $teamName);
        $fn->execute();    
    }

    function addRecordToCountriesOnTeamsTable($dbh, $teamName, $countries)
    {
        $fn = $dbh->prepare("INSERT INTO countries_on_teams (team, country) VALUES (?, ?)");
        $country;
        $fn->bind_param('ss', $teamName, $country);
        
        foreach ($countries as $country)
        {
            $fn->execute();
        }
    }
    
    function updateStandings($dbh)
    {
        $fn = $dbh->query("CALL calculate_team_standings()");
    }
?>

<?php // Functions for validating data
    function validateTeamName($dbh, $teamName, $oldTeamName)
    {
        $error = "";

        if (strlen($teamName)<1) $error .= "Team Name must be >0 characters long";      
        if (strlen($teamName)>32) $error .= "Team Name must be <=32 characters long";
    
        if (!$error && $teamName != $oldTeamName)
        {
            $count;
            $fn = $dbh->prepare("SELECT COUNT(*) FROM users WHERE team = ?");
            $fn->bind_param('s', $teamName);
            $fn->bind_result($count);
            $fn->execute();
            $fn->fetch();
          
            if ($count > 0) $error .= "Team Name already exists.";
        }        
        
        return $error;
    }
    
    function validateCountriesOnTeam($dbh, $countries)
    {
        $error = "";
        
        $countriesInPool = array(null);
        $countriesInPool[1] = 0;
        $countriesInPool[2] = 0;
        $countriesInPool[3] = 0;
        $countriesInPool[4] = 0;
        
        if ($_POST['countries']) 
        { 
            foreach ($_POST['countries'] as $country)
            {
                $pool = getCountryPool($dbh, $country);
                ++$countriesInPool[$pool];
            } 
        }
        
        if ($countriesInPool[1] != 2) $error .= "Must choose exactly 2 countries from Column A<br/>";
        if ($countriesInPool[2] != 2) $error .= "Must choose exactly 2 countries from Column B<br/>";
        if ($countriesInPool[3] != 2) $error .= "Must choose exactly 2 countries from Column C<br/>";
        if ($countriesInPool[4] != 2) $error .= "Must choose exactly 2 countries from Column D<br/>";

        return $error;
    }

    function getCountryPool($dbh, $country)
    {
        $fn = $dbh->prepare("SELECT pool FROM countries WHERE name = ?");
        $fn->bind_param('s', $country);
        $fn->bind_result($pool);
        $fn->execute();
        $fn->fetch();
        
        return $pool;
    }
?>

<?php // Functions for displaying forms
    function showFormWithCurrentValues($dbh)
    {
        if (isset($_SESSION['team_name']))
        {
            // team already exists, user wants to edit choices.
            // retrieve current values from database to use as defaults for the form
            
            $country = '';
            $old_countries = (array)null;
            
            $fn = $dbh->prepare("SELECT country FROM countries_on_teams WHERE team = ?");
            $fn->bind_param('s', $_SESSION['team_name']);
            $fn->bind_result($country);
            $fn->execute();

            while ($fn->fetch())
            {
                $old_countries[] = $country;
            }

            showForm($dbh, $_SESSION['team_name'], $old_countries, '', '');            
        }
        else
        {
            // user is creating a new team
            showForm($dbh, '', (array)null, '', '');
        }       
    }
    
    function showForm($dbh, $teamName, $checked_countries, $errorTeamName, $errorCountries)
    {
        echo '<form id="countriesCheckBoxes" name="countriesCheckBoxes" action="editMyTeam.php" method="post">' . "\n";

        echo "<div class='help_box'>";
        echo "Choose 2 countries from each column - you'll score points as they play matches in the World Cup.";
        echo "</div>";
        if ($errorCountries) echo "<span class='error'>$errorCountries</span>";    
        showCountryCheckBoxes($dbh, $checked_countries);          
            
        echo "<div class='help_box'>";
        echo "Make up a team name (up to 32 characters) - silliness and puns encouraged.";
        echo "</div>";
        
        echo '<div><label for="team_name">Your team name</label> <input type="text" size="32" maxlength="32" id="team_name" name="team_name" value="' . stripslashes($teamName) . '"/></div>';
        if ($errorTeamName) echo "<div class='error'>$errorTeamName</div>";        

        echo '<input type="submit" name="submitMyTeam" value="Submit"/>' ."\n";
        echo "</form>\n";
    }
    
    function showCountryCheckBoxes($dbh, $checked_countries)
    {
        $counter = 0;
   
        if ($result = $dbh->query("SELECT name, world_ranking, flag_path, starting_group FROM countries ORDER BY pool, world_ranking ASC"))
        {
            echo "<div class='country_columns'>";
            while ($country_row = $result->fetch_object())
            {
                if ($counter%8 == 0)
                {
                    echo "<div class='country_column'>\n";
                    echo "<div class='country_column_header'>&darr; Choose 2 &darr;</div>\n";
                }
            
                showCountryCheckBox($country_row->name, $country_row->world_ranking, $country_row->flag_path, $country_row->starting_group, $checked_countries);
             
                ++$counter;
             
                if ($counter%8 == 0)
                    echo "</div>\n";
            }
            
            // Make sure any <ul> is closed regardless of how many countries there are.
            if ($counter%8 != 0)
                echo "</div>\n";
            echo "</div>\n";
        }
        
    }
    
    function showCountryCheckBox($country, $world_ranking, $flag_path, $group, $checked_countries)
    {
        echo '<label for="check' . $country . '">';    
        echo '<div class="country_box';
        if (in_array($country, $checked_countries)) echo ' active';
        echo '">';
        echo '<div class="country_name' . ((strlen($country)>13)?' longName':'') . '">' . $country . '</div>';
        echo '<img class="flag_small" src="' . $flag_path . '"/>';
        echo '<div class="description">Rank: ' . $world_ranking . ', Group ' . $group;
        echo '<input type="checkbox" name="countries[]" id="check' .$country . '" value="' .$country . '"';
        if (in_array($country, $checked_countries)) echo ' checked';
        echo " onclick='return validateCheckBoxes(this)'/></div></div>";
        echo '</label>';
    }
?>

</div>

</body>
</html>
