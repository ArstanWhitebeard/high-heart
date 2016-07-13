var Impromptu = (function Impromptu() {

  return function Impromptu(args) {
    var _this = this;

    _this.tableSummary = function(callback) {
      var target = $('.imp-tab-sum');

      target.html();
      var table = $('<table>').appendTo(target);
      // table.append('<thead><tr><th class="score"></th><th>Player</th>' +
      // '<th class="score">G</th><th class="score">S</th><th class="score">B</th>' +
      // '<th class="score">Pts</th></tr></thead>');

      var tbody = $('<tbody>').appendTo(table);

      // TODO add config file
      $.getJSON('http://localhost:3000/teamstandings/summary', function(json) {
        var standings = json.standings;

        for (var i=0; i<standings.length; ++i) {
          var standing = standings[i];
          var tr = $('<tr>').appendTo(tbody);
          tr.append('<td class="score">' + standing.position + '</td>');
          tr.append('<td class="name">' + standing.username + '</td>');
          // tr.append('<td class="score">' + standing.golds + '</td>');
          // tr.append('<td class="score">' + standing.silvers + '</td>');
          // tr.append('<td class="score">' + standing.bronzes + '</td>');
          tr.append('<td class="score">' + standing.points + '</td>');
        }

        if (callback)
          return callback();
      });
    };

    _this.table = function(callback) {
      var target = $('.imp-tab-full');
      target.html();
      var table = $('<table>').appendTo(target);
      table.append('<thead><tr><th class="score"></th><th>Player</th><th>Team</th>' +
      '<th class="score">G</th><th class="score">S</th><th class="score">B</th>' +
      '<th class="score">Hcp</th><th class="score">Pts</th>' +
      '<th class="flag"></th><th class="flag"></th><th class="flag"></th><th class="flag"></th>' +
      '<th class="flag"></th><th class="flag"></th><th class="flag"></th><th class="flag"></th>' +
      '</tr></thead>');

      var tbody = $('<tbody>').appendTo(table);

      // TODO add config file
      $.getJSON('http://localhost:3000/teamstandings/full', function(json) {
        var standings = json.standings;

        for (var i=0; i<standings.length; ++i) {
          var standing = standings[i];
          var tr = $('<tr>').appendTo(tbody);
          tr.append('<td class="score">' + standing.position + '</td>');
          tr.append('<td class="name">' + standing.username + '</td>');
          tr.append('<td class="name">' + standing.team + '</td>');
          tr.append('<td class="score">' + standing.golds + '</td>');
          tr.append('<td class="score">' + standing.silvers + '</td>');
          tr.append('<td class="score">' + standing.bronzes + '</td>');
          tr.append('<td class="score">' + standing.handicap + '</td>');
          tr.append('<td class="score">' + standing.points + '</td>');

          // TODO read nuumber from config file
          for (var j=0; j<8; ++j) {
            var country = standing.countries[j];

            if (country != null)
              tr.append('<td class="flag"><img class="flag_in" src="../assets/' + country.flagPath + '" title="' + country.country + '"/></td>');
            else
              tr.append('<td class="flag"></td>');

            //<td class="flag"><img class="flag_in" src="./table_files/Germany.png" title="Germany"></td>
          }
        }
      });
    };

    _this.team = function() {
      var target = $('.imp-team');
      target.html();

      // TODO add config file
      $.getJSON('http://localhost:3000/countries', function(json) {
        for (var i=0; i<json.pools.length; ++i) {
          var column = $('<div class="country_column"</div>').appendTo(target);
          column.append('<div class="country_column_header">↓ Choose 2 ↓</div>');
          var countries = json.pools[i].countries;

          for (var j=0; j<countries.length; ++j) {
            var country = countries[j];
            var internalName = country.name.replace(/ /g,"_");

            $('<label for="check' + internalName + '">' +
            '<div class="country_box">' +
            '<div class="country_name">' + country.name + '</div>' +
            '<img class="flag_small" src="../assets/' + country.flagPath + '"/>' +
            '<div class="description">Handicap: ' + country.handicap +
            '<input type="checkbox" class="countryCheckBox" id="check' + internalName + '" value="' + country.name + '" onclick="return impromptu.validateCheckBoxes(this)""/>' +
            '</div></div></label>').appendTo(column);
          }
        }
      });
    };

    _this.validateCheckBoxes = function(box) {
        var countriesInPool = new Array();
        countriesInPool[0] = 0;
        countriesInPool[1] = 0;
        countriesInPool[2] = 0;
        countriesInPool[3] = 0;

        for(i=0; i<document.countriesCheckBoxes.length; ++i) {
            var pool = Math.floor(i/8);

            if (document.countriesCheckBoxes[i].checked)
                countriesInPool[pool]++;
        }

        if (box != null) {
            if (countriesInPool[0] > 2 || countriesInPool[1] > 2 || countriesInPool[2] > 2 || countriesInPool[3] > 2)
                box.checked=false;
            else
                $(box.parentNode.parentNode).toggleClass("active");
        }

        for (j=0; j<4; ++j) {
            if (countriesInPool[j] >= 2)
                $('.country_column:nth-of-type(' + (j+1) + ')').addClass('inactive');
            else
                $('.country_column:nth-of-type(' + (j+1) + ')').removeClass('inactive');
        }
    };

    _this.createTeam = function() {
      var countries = [];

      var checkBoxes = $('.countryCheckBox');

      for(i=0; i<checkBoxes.length; ++i) {
        if (checkBoxes[i].checked) {
          countries.push(checkBoxes[i].id.substr(5).replace(/_/g," "));
        }
      }

      var errors = [];

      // TODO make configurable
      if (countries.length != 8) {
        errors.push("Must choose exactly 8 countries");
      }

      var teamName = $('#teamName').val();
      var userName = $('#userName').val();

      if (userName == null || userName.length == 0) {
        errors.push("Must specify your name");
      }

      if (teamName == null || teamName.length == 0) {
        errors.push("Must specify a team name");
      }

      if (errors.length != 0) {
        $('.error').html(errors.join('; '));
        return;
      }

      var obj = {
        "username": userName,
        "team": teamName,
        "countries": countries
      }

      $.ajax({
        method: 'POST',
        url: 'http://localhost:3000/user',
        data: JSON.stringify(obj),
        dataType: 'json',
        contentType: 'application/json; charset=UTF-8',
        crossDomain: true
      }).done(function(data) {
        window.location.href = '/table';
      }).fail(function(data) {
        $('.error').html(JSON.parse(data.responseText).message);
      });
    };
  }

}());
