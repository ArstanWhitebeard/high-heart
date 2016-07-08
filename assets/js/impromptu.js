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
        console.log(json);

        for (var i=0; i<json.pools.length; ++i) {
          var column = $('<div class="country_column"</div>').appendTo(target);
          var countries = json.pools[i].countries;

          for (var j=0; j<countries.length; ++j) {
            var country = countries[j];
            $('<label for="check' + country.name + 'Spain">' +
            '<div class="country_box">' +
            '<div class="country_name">' + country.name + '</div>' +
            '<img class="flag_small" src="../assets/' + country.flagPath + '"/>' +
            '<div class="description">Handicap: ' + country.handicap +
            '<input type="checkbox" name="countries[]" id="check' + country.name + '" value="' + country.name + '" onclick="return validateCheckBoxes(this)""/>' +
            '</div></div></label>').appendTo(column);
          }
        }
      });
    }
  };
}());
