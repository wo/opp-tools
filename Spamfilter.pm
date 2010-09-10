package Spamfilter;
use strict;
use warnings;
use utf8;
use Digest::MD5;
use AI::Categorizer::Learner::NaiveBayes;
use AI::Categorizer::Document;
use Algorithm::NaiveBayes::Model::Frequency;
use File::Basename qw/dirname/;
use Exporter;
use util::Io;
binmode STDOUT, ":utf8";
our @ISA = ('Exporter');
our @EXPORT = qw(&classify);

#
# A function to guess whether a link is a philosophy paper or not
# ('spam').
#
# I use a combination of Bayesian text classification and various
# heurists. The Bayesian part can be adjusted in the spamcorpus
# directory.
#
# TODO: run the Bayesian classifier on all relevant features (in the
# XML representation), rather than just the plain text content. This
# would hopefully be able to replace many of the heurists.
#

my $verbosity = 0;
sub verbosity {
   $verbosity = shift if @_;
   return $verbosity;
}

my %cfg;
sub cfg {
   %cfg = %{$_[0]} if @_;
   return %cfg;
}

my $bad_anchortext_re 	= qr/^site\s*map$|^home|page\b/xi;
my $bad_path_re 	= qr|://[^/]+/[^\.\?]*(index\..{3,4})?$|xi;
my $bad_filetype_re 	= qr/\.(jpg|gif|ttf|ppt|php|asp)$/xi;

# course notes tend to slip through the spam filter:
my $course_words_re     = qr/course|seminar|schedule|readings|textbook|students|presentation|handout|essay|week|hours/i;
# as do interviews:
my $interview_words_re  = qr/do you/i;
my $bad_words_re        = qr/$course_words_re|$interview_words_re/;

sub classify {
    my $loc = shift or die "classify requires HTTP_RESULT parameter";
    print "classifying document\n" if $verbosity;
    my $is_spam = 0.5;

    if (defined($loc->{text})) {
        print "running Bayesian classifier\n" if $verbosity;
        eval {
            my $nb = AI::Categorizer::Learner::NaiveBayes->restore_state(
                $cfg{'SPAMCORPUS'}.'filterstate');
            $nb->verbose($verbosity ? 3 : 0);
            my $ai_doc = AI::Categorizer::Document->new(content => $loc->{text});
            my $ai_res = $nb->categorize($ai_doc);
            my $ai_ham = $ai_res->{scores}->{ham};
            my $ai_spam = $ai_res->{scores}->{spam};
            $is_spam = _score($is_spam, $ai_spam, $ai_ham, "Bayes score +$ai_ham / -$ai_spam");
            # overwrite naive confidence:
            $is_spam = 0.95 if ($is_spam > 0.95);
            $is_spam = 0.05 if ($is_spam < 0.05);
        };
        if ($@) {
            print "categorization failed! $@\n" if $verbosity;
        }

    }

    if ($loc->{url} && $loc->{url} =~ m/$bad_filetype_re/) {
	$is_spam = _score($is_spam, 0.2, 0.01, 'bad filetype: '.$loc->{url});
    }
    if ($loc->{url} && $loc->{url} =~ m/$bad_path_re/ && $loc->{url} !~ /plato.stanford/) {
	$is_spam = _score($is_spam, 0.2, 0.03, 'bad url: '.$loc->{url});
    }
    if (defined($loc->{anchortext}) && $loc->{anchortext} =~ m/$bad_anchortext_re/) {
	$is_spam = _score($is_spam, 0.3, 0.1, 'bad anchor text: '.$loc->{anchortext});
    }
    
    return $is_spam unless defined($loc->{text});
    my $text = $loc->{text};

    if (!$loc->{filetype} || $loc->{filetype} eq 'html') {
	$is_spam = _score($is_spam, 0.7, 0.3, 'html');
	$is_spam = _score($is_spam, 0.8, length($text)/$loc->{filesize}, 'tags');
	# extra punishment for short HTML:
	if (length($text) < 10000) {
	    $is_spam = _score($is_spam, 0.8, length($text) < 4000 ? 0.25 : 0.5, 'short');
	}
	if (!$loc->{content}) {
            $is_spam = _score($is_spam, 0.5, 0.3, 'no content');
	}
 	else {
	    if ($loc->{content} =~ /<script/i) {
		$is_spam = _score($is_spam, 0.5, 0.2, 'javascript tags');
	    }
	    if ($loc->{content} =~ /<form/i) {
		$is_spam = _score($is_spam, 0.5, 0.2, 'form tags');
	    }
	    my $longest_text = 0; # longest pure text passage without links
	    foreach my $txt (split(/<a /i, $loc->{content})) {
		$longest_text = length($txt) if (length($txt) > $longest_text);
	    }
	    if ($longest_text < 2000) {
		$is_spam = _score($is_spam, 0.8, 0.3, 'no long text passage between links');
	    }
	}
    }
    if (length($text) < 5000) {
	$is_spam = _score($is_spam, 0.7, 0.4, 'short');
	if (length($text) < 2000) {
	    $is_spam = _score($is_spam, 0.7, 0.3, 'very short even');
	}
    }
    elsif (length($text) > 15000) {
	$is_spam = _score($is_spam, 0.3, 0.65, 'long');
    }
    my $num_verbs = 1; $num_verbs++ while $text =~ /\bis\b/g;
    if (length($text)/$num_verbs > 500) {
	$is_spam = _score($is_spam, 0.4, 0.2, 'few verbs '.length($text)."/".$num_verbs); # e.g. bibliographies and other lists
	if (length($text)/$num_verbs > 1000) {
	    $is_spam = _score($is_spam, 0.4, 0.1, 'very few even');
        }
    }
    # course notes or interview?
    my $num_bad = 1; $num_bad++ while $text =~ /$bad_words_re/g;
    if ($num_bad/length($text) > 1/2000) {
	$is_spam = _score($is_spam, $num_bad/length($text), 1/2000, "$num_bad bad keywords");
    }
    if (substr($text,0,500) =~ /interview/i) {
	$is_spam = _score($is_spam, 0.4, 0.1, "interview?");
    }

#    print "ratio: ".(($text =~ tr/\n\n|\r\n\r\n//)/(length($text)));
#    if (($text =~ tr/\n\n|\r\n\r\n//)/(length($text)) > 200) {
#	$is_spam = _score($is_spam, 0.6, 0.4, 'too many paragraphs'); # lists
#    }
    return $is_spam;
}

sub _score {
   my ($h, $eh, $enh, $msg) = @_;
   my $hn = ($eh * $h)/($eh * $h + $enh * (1-$h)); 
   print "$msg: $h => $hn\n" if $verbosity;
   return $hn;
}

1;