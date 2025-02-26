require_relative 'repository'

module Inferno
  module Repositories
    # Repository that deals with persistence for the `TestSession` entity.
    class TestSessions < Repository
      include Import[
                results_repo: 'repositories.results',
                session_data_repo: 'repositories.session_data',
                presets_repo: 'repositories.presets'
              ]

      def json_serializer_options
        {
          include: {
            results: results_repo.json_serializer_options,
            test_runs: {}
          }
        }
      end

      def results_for_test_session(test_session_id)
        test_session_hash =
          self.class::Model
            .find(id: test_session_id)
            .to_json_data(json_serializer_options)
            .deep_symbolize_keys!

        test_session_hash[:results]
          .map! { |result| results_repo.build_entity(result) }
      end

      def apply_preset(test_session_id, preset_id)
        preset = presets_repo.find(preset_id)
        preset.inputs.each do |input|
          session_data_repo.save(input.merge(test_session_id: test_session_id))
        end
      end

      class Model < Sequel::Model(db)
        include Import[test_suites_repo: 'repositories.test_suites']

        one_to_many :results,
                    eager: [:messages, :requests],
                    class: 'Inferno::Repositories::Results::Model',
                    key: :test_session_id
        one_to_many :test_runs, class: 'Inferno::Repositories::TestRuns::Model', key: :test_session_id

        def before_create
          self.id = SecureRandom.uuid
          time = Time.now
          self.created_at ||= time
          self.updated_at ||= time
          super
        end

        def validate
          super
          errors.add(:test_suite_id, 'cannot be empty') if test_suite_id.blank?
          unless test_suites_repo.exists? test_suite_id # rubocop:disable Style/GuardClause
            errors.add(:test_suite_id, "'#{test_suite_id}' is not valid")
          end
        end
      end
    end
  end
end
