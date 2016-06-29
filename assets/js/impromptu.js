var Impromptu = (function Impromptu() {

  return function Impromptu(args) {
    var _this = this;

    _this.teamSummary = function(callback) {
      var target = $('.imp-tab-sum');

      target.html();
      var table = $('<table>').appendTo(target);
      table.append('<thead><tr><th class="score"></th><th>Team</th><th>Player</th><th class="score">G</th><th class="score">S</th><th class="score">B</th><th class="score">Pts</th></tr></thead>')

      var tbody = $('<tbody>').appendTo(table);

      // TODO add config file
      $.getJSON('http://localhost:3000/teamstandings/summary', function(json) {
        var standings = json.standings;

        for (var i=0; i<standings.length; ++i) {
          var standing = standings[i];
          var tr = $('<tr>').appendTo(tbody);
          tr.append('<td>' + standing.position + '</td>');
          tr.append('<td>' + standing.username + '</td>');
          tr.append('<td>' + standing.team + '</td>');
          tr.append('<td>' + standing.golds + '</td>');
          tr.append('<td>' + standing.silvers + '</td>');
          tr.append('<td>' + standing.bronzes + '</td>');
          tr.append('<td>' + standing.points + '</td>');
        }

        if (callback)
          return callback();
      });
    }
  };
}());
